import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Res, UploadedFiles, UseInterceptors, Logger , InternalServerErrorException} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
//import { randomUUID } from 'crypto';
import { FilesService } from './files.service';
import archiver from 'archiver';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function decodeOriginalName(originalname: string): string {
  // multer에서 한글 파일명이 깨지는 케이스(UTF-8 → latin1로 들어오는 경우) 보정
  try {
    const decoded = Buffer.from(originalname, 'latin1').toString('utf8');
    // 디코딩 결과에 한글이 포함되거나, 원본에 흔한 모지바케 문자가 있는 경우만 교체
    const looksMojibake = /[ÃÂÐ]/.test(originalname);
    const decodedHasKorean = /[가-힣]/.test(decoded);
    if (decodedHasKorean || looksMojibake) return decoded;
  } catch {
    // ignore
  }
  return originalname;
}

@Controller('api/files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);
  constructor(private readonly filesService: FilesService) {}

  /**
   * fileList로 파일 목록 조회
   */
  @Post()
  async list(@Body('fileList') fileList: string[], @Res() res: Response) { 
    const items = await this.filesService.list(fileList);
      try {
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="my-download.zip"',
      });

      const archive = archiver('zip', {
        zlib: { level: 9 }, 
      });

      archive.on('error', (err) => {
        throw new InternalServerErrorException('ZIP 압축 중 오류가 발생했습니다.', err.message);
      });
      archive.pipe(res);
      
      for (const item of items) {
        console.log(item.saveFileNm);
        console.log(item.fileNm);
        const actualFilePath = path.join(
          process.cwd(), 
          'uploads', 
          //item.fileGrpId, 
          (item as any).saveFileNm // 서비스 반환값에 맞게 속성명 변경 필요
        ); 
        console.log(actualFilePath);

        // 파일이 디스크에 존재하는지 검사 후 추가
        if (fs.existsSync(actualFilePath)) {
          archive.file(actualFilePath, { name: item.fileNm as string });
        } else {
          this.logger.warn(`파일을 찾을 수 없어 압축에서 제외됨: ${actualFilePath}`);
        }
      }

      // 4. 파일 추가가 끝났음을 알림 (이후 스트림이 종료되고 다운로드가 완료됨)
      await archive.finalize();

    } catch (error) {
      console.error('ZIP 다운로드 에러:', error);
      // 이미 헤더가 전송된 후에는 일반적인 예외 처리가 먹히지 않을 수 있으므로
      if (!res.headersSent) {
        res.status(500).json({ message: '다운로드 처리 중 오류가 발생했습니다.' });
      }
    }
    return { items };
  }

  /**
   * 파일 업로드
   * - FE는 FormData로 files(복수) + fileGrpId(옵션) 전달
   */
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          // multipart에서는 field(fileGrpId)보다 file이 먼저 들어올 수 있어서
          // FE에서 X-File-Grp-Id 헤더를 함께 보내도록 강제한다.
          const reqAny = req as any;
          const body = (reqAny.body ??= {});
          const headerGrp = (reqAny.headers?.['x-file-grp-id'] as string) || '';
          const fromHeader = typeof headerGrp === 'string' ? headerGrp.trim() : '';

          // 1. 오늘 날짜를 YYYY-MM-DD 형식으로 생성 (원하신다면 YYYYMMDD로 변경 가능)
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`; // 예: '2026-03-11'

          // 2. randomUUID() 대신 dateString을 폴백(Fallback)으로 사용
          // (만약 프론트의 요청과 무관하게 '무조건' 날짜로만 저장하고 싶으시다면 const fileGrpId = dateString; 으로 쓰시면 됩니다.)
          //const fileGrpId = (body.fileGrpId || fromHeader || randomUUID()).trim();
          const fileGrpId = (body.fileGrpId || fromHeader || dateString).trim();
          
        console.log(fileGrpId);
          body.fileGrpId = fileGrpId; // 컨트롤러의 @Body()로도 전달되도록 유지
          const dest = path.join(process.cwd(), 'uploads');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const orig = decodeOriginalName(file.originalname);
          console.log(orig);

          //const fileId = randomUUID();
          //const ext = path.extname(orig);
          //const fileId = orig;
          
          // 1. 확장자 및 파일명 추출
          const ext = path.extname(orig); 

          // 2. 전체 파일명에서 확장자 부분만 쏙 빼고 추출 (예: 'test')
          const fileId = path.basename(orig, ext);

          // destination에서 넘겨준 저장 경로 가져오기
          const reqAny = req as any;
          const body = (reqAny.body ??= {});
          const headerGrp = (reqAny.headers?.['x-file-grp-id'] as string) || '';
          const fromHeader = typeof headerGrp === 'string' ? headerGrp.trim() : '';
          
          const now = new Date();
          const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          
          const fileGrpId = (body.fileGrpId || fromHeader || dateString).trim();
          const dir = path.join(process.cwd(), 'uploads');

          let saveName = orig;
          let counter = 1;

          // ✅ 중복 파일명 체크 및 Rename 로직 (test.hwp -> test (1).hwp)
          while (fs.existsSync(path.join(dir, saveName))) {
            saveName = `${fileId} (${counter})${ext}`;
            counter++;
          }

          // multer file 객체에 메타 저장(서비스에서 사용)
          (file as any).__origName = orig;                // DB에 보여질 원본 이름 (test.hwp)
          (file as any).__saveName = saveName;            // 실제 저장된 이름 (test (1).hwp)
          (file as any).__fileId = path.basename(saveName, ext);

          cb(null, saveName);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Headers('x-file-grp-id') headerGrpId?: string,
  ) {
    if (!files || files.length === 0) {
      // Nest가 500으로 떨어지지 않게 명확히 처리
      const grp = (body?.fileGrpId || headerGrpId || null) as string | null;
      return { fileGrpId: grp, items: [] };
    }

    const firstGrp = (files[0] as any).__grpId as string | undefined;
    const fileGrpId = (body?.fileGrpId || headerGrpId || firstGrp || '').trim();

    // ✅ 업로드 디버깅: body/header/file-fieldname/저장경로를 한 번에 출력
    const fieldNames = files.map((f) => f.fieldname);
    const destinations = files.map((f) => (f as any).destination || (f as any).path || '');
    this.logger.debug(
      `[AttachUpload] body.fileGrpId='${body?.fileGrpId ?? ''}' header.x-file-grp-id='${headerGrpId ?? ''}' resolved.fileGrpId='${fileGrpId}' fields=[${fieldNames.join(',')}] dest=[${destinations.join(',')}]`,
    );

    // FE는 항상 FormData에 'files'로 전송해야 한다.
    if (fieldNames.some((n) => n !== 'files')) {
      throw new BadRequestException(
        `Multer fieldname mismatch: expected 'files' but got [${fieldNames.join(',')}]`,
      );
    }
    if (!fileGrpId) {
      throw new BadRequestException('fileGrpId is required');
    }

    const saved = await this.filesService.saveUploadedFiles(fileGrpId, files);
    return { fileGrpId, items: saved };
  }

  // /**
  //  * 파일 다운로드
  //  */
  // @Get(':fileGrpId/:fileId/download')
  // async download(
  //   @Param('fileGrpId') fileGrpId: string,
  //   @Param('fileId') fileId: string,
  //   @Res() res: Response,
  // ) {
  //   return this.filesService.download(fileGrpId, fileId, res);
  // }

  // /**
  //  * 파일 삭제(논리삭제 + 실제 파일 삭제)
  //  */
  // @Delete(':fileGrpId/:fileId')
  // async remove(@Param('fileGrpId') fileGrpId: string, @Param('fileId') fileId: string) {
  //   await this.filesService.remove(fileGrpId, fileId);
  //   return { ok: true };
  // }
}
