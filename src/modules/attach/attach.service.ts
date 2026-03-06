import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AttachFileEntity } from './entities/attach-file.entity';
import * as fs from 'fs';
import * as path from 'path';

type UploadedFile = Express.Multer.File & {
  __fileId?: string;
  __origName?: string;
  __saveName?: string;
  __grpId?: string;
};

@Injectable()
export class AttachService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AttachFileEntity)
    private readonly repo: Repository<AttachFileEntity>,
  ) {}

  // 컨트롤러에서 remove()를 호출하는 이름과의 하위호환
  async remove(fileGrpId: string, fileId: string) {
    return this.delete(fileGrpId, fileId);
  }

  async list(fileGrpId: string) {
    if (!fileGrpId || !String(fileGrpId).trim()) {
      return [];
    }
    const items = await this.repo.find({
      // ✅ TypeORM where/order는 "엔티티 프로퍼티명"을 사용해야 함
      //    (DB 컬럼명 snake_case는 @Column({ name })로 매핑)
      where: { fileGrpId, fileUseYn: 'Y' },
      order: { regDt: 'ASC' },
    });
    // 프론트에서는 AttachDto[] 형태를 기대
    return items.map((x) => ({
      fileGrpId: x.fileGrpId,
      fileId: x.fileId,
      fileNm: x.fileNm,
      fileSize: x.fileSize,
    }));
  }

  /**
   * Controller에서 호출하는 메서드명과 통일.
   * (이전 버전 컨트롤러가 saveUploadedFiles()를 호출)
   */
  async saveUploadedFiles(fileGrpId: string, files: UploadedFile[]) {
    return this.upload(fileGrpId, files);
  }

  async upload(fileGrpId: string, files: UploadedFile[]) {
    if (!files || files.length === 0) {
      return { fileGrpId: fileGrpId ?? null, items: [] };
    }

    const rows: AttachFileEntity[] = [];

    for (const f of files) {
      const orig = f.__origName ?? f.originalname;
      const save = f.__saveName ?? path.basename(f.path);
      const fileId = f.__fileId ?? path.parse(save).name;
      const grp = f.__grpId ?? fileGrpId;
      if (!grp) {
        // 이 케이스는 정상적으로는 발생하지 않아야 하지만,
        // 혹시라도 fileGrpId가 누락되면 DB NOT NULL 제약으로 500이 나므로 방어
        throw new BadRequestException('fileGrpId가 없습니다. 업로드 요청을 확인하세요.');
      }
      const ext = path.extname(save).replace('.', '').toLowerCase();
      const dir = path.dirname(f.path);
      const relDir = path.relative(process.cwd(), dir).replace(/\\/g, '/');

      rows.push(
        this.repo.create({
          fileGrpId: grp,
          fileId,
          fileNm: orig,
          saveFileNm: save,
          filePath: relDir,
          fileExe: ext,
          fileSize: f.size,
          fileUseYn: 'Y',
          regId: 'SYSTEM',
          modId: 'SYSTEM',
        }),
      );
    }

    // ✅ DB 저장이 실패하면(트랜잭션 롤백) Multer가 디스크에 저장해둔 파일도 같이 정리
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(AttachFileEntity).save(rows);
      });
    } catch (e) {
      // 디스크 롤백(가능한 범위)
      for (const f of files) {
        try {
          if (f?.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
        } catch {
          // ignore
        }
      }
      throw e;
    }

    const finalGrpId = rows[0]?.fileGrpId ?? fileGrpId ?? null;
    return {
      fileGrpId: finalGrpId,
      items: rows.map((r) => ({
        fileGrpId: r.fileGrpId,
        fileId: r.fileId,
        fileNm: r.fileNm,
        fileSize: r.fileSize,
      })),
    };
  }

  async delete(fileGrpId: string, fileId: string) {
    // ✅ 현재 정책: "DB만 논리삭제(file_use_yn='N')" 하고, 실제 파일은 디스크에 남겨둔다.
    //    (운영에서 스토리지 보관정책/감사/복구를 위해 파일을 남겨두고 싶을 때 유용)
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(AttachFileEntity);
      const found = await repo.findOne({ where: { fileGrpId, fileId } });
      if (!found) throw new NotFoundException('파일이 존재하지 않습니다.');

      found.fileUseYn = 'N';
      found.modId = 'SYSTEM';
      await repo.save(found);
    });

    // ---------------------------------------------------------------------
    // ✅ 실제 파일(디스크)도 함께 삭제하고 싶다면 아래 로직을 "주석 해제"해서 사용하세요.
    //    - 권장 방식(일관성): 1) 파일을 임시로 이동(.trash_*)  2) DB 트랜잭션 커밋
    //                      3) 커밋 성공 시 임시파일을 삭제
    //                      4) DB 트랜잭션 실패 시 임시파일을 원복
    //    - 아래는 "커밋 이후"에 실행하는 간단 버전입니다(운영에서는 배치/스케줄러로 정리도 가능).
    // ---------------------------------------------------------------------
    // const found = await this.repo.findOne({ where: { fileGrpId, fileId } });
    // if (found) {
    //   const abs = path.isAbsolute(found.filePath)
    //     ? path.resolve(found.filePath, found.saveFileNm)
    //     : path.resolve(process.cwd(), found.filePath, found.saveFileNm);
    //   // ⚠️ 주의: 물리삭제를 켜면 복구 불가합니다. (정책 확인 후 사용)
    //   // if (fs.existsSync(abs)) fs.unlinkSync(abs);
    // }

    return { ok: true };
  }

  // 컨트롤러/FE 호환용 별칭
  // (기존 컨트롤러가 remove()를 호출하는 경우가 있어 런타임 에러 방지)
  async remove(fileGrpId: string, fileId: string) {
    return this.delete(fileGrpId, fileId);
  }

  async download(fileGrpId: string, fileId: string, res: any) {
    const found = await this.repo.findOne({
      where: { fileGrpId, fileId, fileUseYn: 'Y' },
    });
    if (!found) throw new NotFoundException('파일이 존재하지 않습니다.');

    // filePath는 보통 상대경로로 저장되지만, 환경에 따라 절대경로가 들어갈 수 있어
    // 둘 다 안전하게 처리한다.
    const abs = path.isAbsolute(found.filePath)
      ? path.resolve(found.filePath, found.saveFileNm)
      : path.resolve(process.cwd(), found.filePath, found.saveFileNm);
    if (!fs.existsSync(abs)) throw new NotFoundException('파일이 존재하지 않습니다.');

    // Content-Disposition filename*=UTF-8''... 방식으로 한글 파일명 깨짐 방지
    const encoded = encodeURIComponent(found.fileNm);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(abs);
  }
}
