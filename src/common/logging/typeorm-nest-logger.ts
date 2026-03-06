import { Logger as NestLogger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

function formatValue(v: any) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  const s = String(v).replace(/'/g, "''");
  return `'${s}'`;
}

function substituteParams(query: string, params?: any[]) {
  if (!params?.length) return query;
  let q = query;
  params.forEach((p, idx) => {
    const token = new RegExp('\\$' + (idx + 1) + '(?!\\d)', 'g');
    q = q.replace(token, `${formatValue(p)} /*$${idx + 1}*/`);
  });
  return q;
}

function normalizeQuery(query: string) {
  // 1) remove double quotes around identifiers
  let q = query.replace(/"/g, '');
  // 2) remove alias prefixes like Alias.column -> column (only when Alias starts with capital letter or ends with Entity)
  q = q.replace(/\b([A-Z][A-Za-z0-9_]*|[A-Za-z0-9_]*Entity)\.([A-Za-z0-9_]+)\b/g, '$2');
  return q;
}

function prettyPrint(query: string) {
  // insert newlines before common SQL keywords
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'ORDER BY',
    'GROUP BY',
    'LIMIT',
    'OFFSET',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'VALUES',
    'RETURNING',
    'START TRANSACTION',
    'COMMIT',
    'ROLLBACK',
    'INSERT INTO',
    'UPDATE',
    'DELETE',
  ];

  let q = query.replace(/\s+/g, ' ').trim();

  // handle multi-word first
  keywords
    .sort((a, b) => b.length - a.length)
    .forEach((k) => {
      const rx = new RegExp('\\b' + k.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      q = q.replace(rx, '\n' + k);
    });

  // clean leading newline
  q = q.replace(/^\n+/, '');

  // indentation: simple for SELECT columns
  q = q.replace(/\nSELECT\s+/i, '\nSELECT\n  ');
  q = q.replace(/\s,\s/g, ',\n  ');
  q = q.replace(/\nFROM\b/i, '\nFROM\n  ');
  q = q.replace(/\nWHERE\b/i, '\nWHERE\n  ');
  q = q.replace(/\nAND\b/g, '\n  AND');
  q = q.replace(/\nOR\b/g, '\n  OR');
  q = q.replace(/\nORDER BY\b/i, '\nORDER BY\n  ');
  q = q.replace(/\nGROUP BY\b/i, '\nGROUP BY\n  ');
  q = q.replace(/\nINNER JOIN\b/gi, '\nINNER JOIN\n  ');
  q = q.replace(/\nLEFT JOIN\b/gi, '\nLEFT JOIN\n  ');
  q = q.replace(/\nVALUES\b/i, '\nVALUES\n  ');
  q = q.replace(/\nLIMIT\b/i, '\nLIMIT ');
  q = q.replace(/\nOFFSET\b/i, '\nOFFSET ');

  return q.trim();
}

/**
 * TypeORM Query Logger (Nest Logger 기반)
 * - query 전체(가독성 포맷 + 파라미터 치환)
 * - parameters
 * - 실행시간(ms) 표시: maxQueryExecutionTime=0 설정 시 모든 쿼리가 slowQuery 콜백으로 들어옴
 */
export class TypeOrmNestLogger implements TypeOrmLogger {
  private readonly log = new NestLogger('DB');

  // query 로그는 slowQuery에서만 찍어서 중복을 방지
  logQuery(_query: string, _parameters?: any[], _queryRunner?: QueryRunner) {}

  logQueryError(error: string | Error, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const q = prettyPrint(normalizeQuery(substituteParams(query, parameters)));
    this.log.error(`${error}\n\n${q}`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const stamp = new Date().toLocaleTimeString('ko-KR', { hour12: true });
    const header = `[TypeORM Query]  |  Time: ${time}ms  |  Timestamp: ${stamp}`;
    const q = prettyPrint(normalizeQuery(substituteParams(query, parameters)));

    this.log.debug(`${header}\n\n${q}\n`);
    if (parameters?.length) {
      this.log.debug(`Params: ${JSON.stringify(parameters)}`);
    } else {
      this.log.debug(`Params: []`);
    }
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.log.log(message);
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.log.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: any, _queryRunner?: QueryRunner) {
    if (level === 'warn') this.log.warn(String(message));
    else this.log.log(String(message));
  }
}
