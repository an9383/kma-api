import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

@Injectable()
export class HwpService {
  private readonly log = new Logger('HwpService');

  private normalizeOriginalName(name: string) {
    if (!name) return 'input.hwp';
    // Multer가 originalname을 latin1로 해석해 한글이 깨져 들어오는 케이스가 있어 보정
    // 예: ì¼ê°ì¤ë¥.hwp -> 삼강오륜.hwp
    try {
      const decoded = Buffer.from(name, 'latin1').toString('utf8');
      // decoded 안에 한글이 있고, 원본은 깨짐 패턴이 강할 때만 교체
      const hasHangul = /[\u3131-\u318E\uAC00-\uD7A3]/.test(decoded);
      const looksMojibake = /[ÃÂìíêëäå]/.test(name);
      return hasHangul && looksMojibake ? decoded : name;
    } catch {
      return name;
    }
  }

  /**
   * HWP -> HTML 변환
   * - 기본은 "변환 파이프라인"만 제공 (python + hwp5html 등 외부 도구 필요)
   * - 도구가 없으면 안내 HTML을 반환
   */
  async convertToHtml(originalName: string, buf: Buffer): Promise<string> {
    const safeName = this.normalizeOriginalName(originalName);

    // 1) 임시 파일로 저장
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kma-hwp-'));
    const inPath = path.join(tmpDir, safeName || 'input.hwp');
    fs.writeFileSync(inPath, buf);

    // 2) python 스크립트가 있으면 실행 (선택)
    const scriptPath = path.resolve(process.cwd(), 'src', 'modules', 'hwp', 'scripts', 'hwp2html.py');
    if (fs.existsSync(scriptPath)) {
      const outPath = path.join(tmpDir, 'output.html');
      const r = spawnSync('python', [scriptPath, inPath, outPath], { encoding: 'utf-8' });
      if (r.status === 0 && fs.existsSync(outPath)) {
        const html = fs.readFileSync(outPath, 'utf-8');
        return html;
      }
      this.log.warn(`HWP convert failed: ${r.stderr || r.stdout}`);
    }

    // 3) fallback: 최소 안내
    const escaped = safeName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div style="font-family: sans-serif">
        <h3>HWP 문서 불러오기</h3>
        <p>업로드된 파일: <b>${escaped}</b></p>
        <p>현재 프로젝트에는 HWP 변환 엔진이 포함되어 있지 않아, 변환 파이프라인만 구성되어 있습니다.</p>
        <ul>
          <li>서버에 python과 변환 스크립트(src/modules/hwp/scripts/hwp2html.py) + hwp5html(또는 동등 도구)를 설치하면,
              글자/스타일/표 기반으로 HTML 렌더링이 가능합니다.</li>
        </ul>
      </div>
    `;
  }
}
