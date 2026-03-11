import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { FilesEntity } from './entities/files.entity';
import * as fs from 'fs';
import * as path from 'path';

type UploadedFile = Express.Multer.File & {
  __fileId?: string;
  __origName?: string;
  __saveName?: string;
  __grpId?: string;
};

@Injectable()
export class FilesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(FilesEntity)
    private readonly fileRepository: Repository<FilesEntity>
  ) {}

    async list(fileList: string[]) {
    if (!Array.isArray(fileList) || fileList.length === 0) {
    return [];
    }

    const items = await this.fileRepository.find({
      where: { fileNm: In(fileList), fileUseYn: 'Y' },
      order: { regDt: 'DESC' },
      take: fileList.length,
    });
    console.log(items);
    
    // 프론트에서는 AttachDto[] 형태를 기대
    return items.map((x) => ({
      fileGrpId: x.fileGrpId,
      fileId: x.fileId,
      fileNm: x.fileNm,
      saveFileNm: x.saveFileNm,
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
  
      const rows: FilesEntity[] = [];
  
      for (const f of files) {
        const orig = f.__origName ?? f.originalname;
        const save = f.__saveName ?? path.basename(f.path);
        //const fileId = f.__fileId ?? path.parse(save).name;
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
          this.fileRepository.create({
            //fileGrpId: grp,
            //fileId,
            fileNm: orig,
            saveFileNm: save,
            filePath: relDir,
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
          await manager.getRepository(FilesEntity).save(rows);
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
          //fileId: r.fileId,
          fileNm: r.fileNm,
          saveFileNm: r.saveFileNm,
          filePath: r.filePath,
          fileSize: r.fileSize,
        })),
      };
    }
}
