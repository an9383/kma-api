import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { FilesService } from './files.service';

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
  async list(@Body('fileList') fileList: string[]) { 
    const items = await this.filesService.list(fileList);
    return { items };
  }

  // /**
  //  * fileGrpId로 파일 목록 조회
  //  */
  // @Get(':fileGrpId')
  // async list() {
  //   const items = await this.filesService.list(fileGrpId);
  //   return { items };
  // }

  // /**
  //  * 파일 업로드
  //  * - FE는 FormData로 files(복수) + fileGrpId(옵션) 전달
  //  */
  // @Post('upload')
  // @UseInterceptors(
  //   FilesInterceptor('files', 20, {
  //     storage: diskStorage({
  //       destination: (req, _file, cb) => {
  //         // ⚠ multipart에서는 field(fileGrpId)보다 file이 먼저 들어올 수 있어서
  //         // FE에서 X-File-Grp-Id 헤더를 함께 보내도록 강제한다.
  //         const reqAny = req as any;
  //         const body = (reqAny.body ??= {});
  //         const headerGrp = (reqAny.headers?.['x-file-grp-id'] as string) || '';
  //         const fromHeader = typeof headerGrp === 'string' ? headerGrp.trim() : '';

  //         const fileGrpId = (body.fileGrpId || fromHeader || randomUUID()).trim();
  //         body.fileGrpId = fileGrpId; // 컨트롤러의 @Body()로도 전달되도록 유지
  //         const dest = path.join(process.cwd(), 'uploads', fileGrpId);
  //         ensureDir(dest);
  //         cb(null, dest);
  //       },
  //       filename: (req, file, cb) => {
  //         const orig = decodeOriginalName(file.originalname);
  //         const fileId = randomUUID();
  //         const ext = path.extname(orig);
  //         // multer file 객체에 메타 저장(서비스에서 사용)
  //         (file as any).__fileId = fileId;
  //         (file as any).__origName = orig;
  //         cb(null, `${fileId}${ext}`);
  //       },
  //     }),
  //     limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  //   }),
  // )
  // async upload(
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() body: any,
  //   @Headers('x-file-grp-id') headerGrpId?: string,
  // ) {
  //   if (!files || files.length === 0) {
  //     // Nest가 500으로 떨어지지 않게 명확히 처리
  //     const grp = (body?.fileGrpId || headerGrpId || null) as string | null;
  //     return { fileGrpId: grp, items: [] };
  //   }

  //   const firstGrp = (files[0] as any).__grpId as string | undefined;
  //   const fileGrpId = (body?.fileGrpId || headerGrpId || firstGrp || '').trim();

  //   // ✅ 업로드 디버깅: body/header/file-fieldname/저장경로를 한 번에 출력
  //   const fieldNames = files.map((f) => f.fieldname);
  //   const destinations = files.map((f) => (f as any).destination || (f as any).path || '');
  //   this.logger.debug(
  //     `[AttachUpload] body.fileGrpId='${body?.fileGrpId ?? ''}' header.x-file-grp-id='${headerGrpId ?? ''}' resolved.fileGrpId='${fileGrpId}' fields=[${fieldNames.join(',')}] dest=[${destinations.join(',')}]`,
  //   );

  //   // FE는 항상 FormData에 'files'로 전송해야 한다.
  //   if (fieldNames.some((n) => n !== 'files')) {
  //     throw new BadRequestException(
  //       `Multer fieldname mismatch: expected 'files' but got [${fieldNames.join(',')}]`,
  //     );
  //   }
  //   if (!fileGrpId) {
  //     throw new BadRequestException('fileGrpId is required');
  //   }

  //   const saved = await this.filesService.saveUploadedFiles(fileGrpId, files);
  //   return { fileGrpId, items: saved };
  // }

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
