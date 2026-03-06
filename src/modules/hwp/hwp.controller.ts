import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HwpService } from './hwp.service';

@Controller('api/hwp')
export class HwpController {
  constructor(private readonly service: HwpService) {}

  @Post('convert')
  @UseInterceptors(FileInterceptor('file'))
  async convert(@UploadedFile() file?: Express.Multer.File) {
    if (!file) return { ok: false, message: '파일이 없습니다.' };
    const html = await this.service.convertToHtml(file.originalname, file.buffer);
    return { ok: true, html };
  }
}
