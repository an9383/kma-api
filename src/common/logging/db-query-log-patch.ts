import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

function fmtValue(v: any): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  // Buffer
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) return `'[buffer:${v.length}]'`;
  const s = String(v).replace(/'/g, "''");
  return `'${s}'`;
}

function splitSelectCols(selectList: string): string[] {
  const out: string[] = [];
  let buf = '';
  let depth = 0;
  let inS = false;
  let inD = false;

  for (let i = 0; i < selectList.length; i++) {
    const ch = selectList[i];
    const prev = i > 0 ? selectList[i - 1] : '';
    if (!inD && ch === "'" && prev !== '\\') inS = !inS;
    else if (!inS && ch === '"' && prev !== '\\') inD = !inD;

    if (!inS && !inD) {
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;
      if (ch === ',' && depth === 0) {
        const v = buf.trim();
        if (v) out.push(v);
        buf = '';
        continue;
      }
    }
    buf += ch;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

function prettySql(rawSql: string): string {
  // 0) 공백 정규화 + 쌍따옴표 제거(Postgres quoting)
  let sql = rawSql.replace(/\s+/g, ' ').replace(/"/g, '').trim();

  // 1) FROM/JOIN alias 추출 (ex: FROM kma_mbr_m MemberEntity)
  //    -> alias(prefix) 제거, 불필요한 AS 제거에 사용
  const aliases = new Set<string>();
  const aliasRe = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_.]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(sql))) aliases.add(m[2]);

  // 2) alias prefix 제거 (MemberEntity.xxx -> xxx)
  for (const a of aliases) {
    sql = sql.replace(new RegExp(`\\b${a}\\.`, 'g'), '');
  }

  // 3) SELECT alias(AS ...) 정리
  //    user_id AS MemberEntity_user_id  -> user_id
  //    user_id AS user_id               -> user_id
  sql = sql.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (all, col, asName) => {
    for (const a of aliases) {
      if (asName === `${a}_${col}`) return col;
    }
    if (asName === col) return col;
    return all;
  });

  // 4) FROM/JOIN 절에서 alias 제거 (FROM kma_mbr_m MemberEntity -> FROM kma_mbr_m)
  for (const a of aliases) {
    sql = sql.replace(new RegExp(`\\bFROM\\s+([^ ]+)\\s+${a}\\b`, 'i'), (_all, tbl) => `FROM ${tbl}`);
    sql = sql.replace(new RegExp(`\\bJOIN\\s+([^ ]+)\\s+${a}\\b`, 'i'), (_all, tbl) => `JOIN ${tbl}`);
  }

  // 5) 키워드 기준 섹션 줄바꿈 (스크린샷 형태에 맞춰 섹션 헤더를 "단독 라인"으로)
  const kw = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET'];
  for (const k of kw) {
    sql = sql.replace(new RegExp(`\\b${k}\\b`, 'gi'), `\n${k}`);
  }
  sql = sql.replace(/\n{2,}/g, '\n').trim();

  // 6) SELECT 컬럼 목록: "," 기준 줄바꿈 + indent 고정(2 spaces)
  //    -> "SELECT" 다음 줄부터 컬럼을 한 줄씩
  const selMatch = sql.match(/(?:^|\n)SELECT\s+([\s\S]*?)\nFROM\b/i);
  if (selMatch) {
    const cols = splitSelectCols(selMatch[1]);
    const selectFmt = ['SELECT', ...cols.map((c, i) => `    ${c}${i === cols.length - 1 ? '' : ','}`)].join(
      '\n',
    );
    sql = sql.replace(/(?:^|\n)SELECT\s+[\s\S]*?\nFROM\b/i, `\n${selectFmt}\nFROM`);
  }

  // 7) WHERE 조건 AND/OR 줄바꿈 (+ indent 4)
  sql = sql.replace(/\s+(AND|OR)\s+/gi, (_m, g1) => `\n    ${g1} `);

  // 8) 최종 여백 정리
  return sql.replace(/\n{3,}/g, '\n\n').trim();
}

function applyParams(sql: string, params: any[]): { sqlWithValues: string; paramsLine: string } {
  if (!params || params.length === 0) return { sqlWithValues: sql, paramsLine: '[]' };

  let out = sql;
  // $1, $2 ... 치환 + 주석(placeholder) 표시
  params.forEach((v, i) => {
    const idx = i + 1;
    const re = new RegExp(`\\$${idx}\\b`, 'g');
    out = out.replace(re, `${fmtValue(v)} /*$${idx}*/`);
  });

  const paramsLine = JSON.stringify(params);
  return { sqlWithValues: out, paramsLine };
}

@Injectable()
export class DbQueryLogPatch implements OnModuleInit {
  private readonly logger = new Logger('DB');
  private patched = false;

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.patched) return;
    this.patched = true;

    const ds: any = this.dataSource as any;

    const origCreateQueryRunner = this.dataSource.createQueryRunner.bind(this.dataSource);
    this.dataSource.createQueryRunner = ((mode?: any) => {
      const qr: QueryRunner = origCreateQueryRunner(mode);
      this.wrapQueryRunner(qr);
      return qr;
    }) as any;

    // DataSource.query(...) 도 로그 누락 방지
    if (typeof ds.query === 'function') {
      const origQuery = ds.query.bind(ds);
      ds.query = async (...args: any[]) => {
        const query: string = String(args[0]);
        const parameters: any[] = Array.isArray(args[1]) ? args[1] : [];
        const start = process.hrtime.bigint();
        try {
          const res = await origQuery(...args);
          const end = process.hrtime.bigint();
          this.logQuery(query, parameters ?? [], Number(end - start) / 1e6, res);
          return res;
        } catch (e: any) {
          const end = process.hrtime.bigint();
          this.logQueryError(query, parameters ?? [], Number(end - start) / 1e6, e);
          throw e;
        }
      };
    }
  }

  private wrapQueryRunner(qr: QueryRunner) {
    const anyQr: any = qr as any;
    if (anyQr.__kma_patched) return;
    anyQr.__kma_patched = true;

    const orig = (qr.query as any).bind(qr);
    qr.query = (async (...args: any[]) => {
      const query = String(args[0]);
      const parameters: any[] = Array.isArray(args[1]) ? args[1] : [];
      const start = process.hrtime.bigint();
      try {
        const res = await orig(...args);
        const end = process.hrtime.bigint();
        this.logQuery(query, parameters ?? [], Number(end - start) / 1e6, res);
        return res;
      } catch (e: any) {
        const end = process.hrtime.bigint();
        this.logQueryError(query, parameters ?? [], Number(end - start) / 1e6, e);
        throw e;
      }
    }) as any;
  }

  private logQuery(sqlRaw: string, params: any[], ms: number, result: any) {
    // 1. 이전 로그와 구분되도록 한 줄 띄움
    console.log('');

    const ts = new Date();
    const tsStr = `${ts.toLocaleDateString('ko-KR')} ${ts.toLocaleTimeString('ko-KR')}`;
    const pretty = prettySql(sqlRaw);
    const { sqlWithValues, paramsLine } = applyParams(pretty, params);

    // SELECT 결과 row 수 추정
    const isSelect = /^\s*SELECT\b/i.test(sqlRaw);
    let rowsInfo = '';
    if (isSelect) {
      const rows = Array.isArray(result) ? result.length : result?.raw ? result.raw.length : undefined;
      if (typeof rows === 'number') rowsInfo = ` rows=${rows}`;
    }

    // ✅ 요구사항: Query/Params 본문은 "하얀색"으로 (터미널 ANSI 37)
    const W = '\x1b[37m';
    const R = '\x1b[0m';

    // 2. Nest 헤더와 QUERY 본문 사이 공백 제거 (\n\n -> \n)
    this.logger.debug(
      `[DB Query] | Time: ${ms.toFixed(1)}ms | Timestamp: ${tsStr}${rowsInfo}` +
        `\n--- QUERY ---\n${W}${sqlWithValues}${R}` +
        `\n\n--- PARAMS ---\n${W}${paramsLine}${R}`,
    );
  }

  private logQueryError(sqlRaw: string, params: any[], ms: number, err: any) {
    // 에러 시에도 한 줄 띄움
    console.log('');

    const ts = new Date();
    const tsStr = `${ts.toLocaleDateString('ko-KR')} ${ts.toLocaleTimeString('ko-KR')}`;
    const pretty = prettySql(sqlRaw);
    const { sqlWithValues } = applyParams(pretty, params);
    const W = '\x1b[37m';
    const R = '\x1b[0m';

    // 에러 시에도 헤더와 본문 사이 공백 제거
    this.logger.error(
      `[DB Query ERROR] | Time: ${ms.toFixed(1)}ms | Timestamp: ${tsStr}` +
        `\n--- QUERY ---\n${W}${sqlWithValues}${R}` +
        `\n\n--- ERROR ---\n${err?.message ?? err}`,
    );
  }
}
