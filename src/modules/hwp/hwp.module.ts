import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { HwpController } from './hwp.controller';
import { HwpService } from './hwp.service';

@Module({
  imports: [
    MulterModule.register({
      // 메모리 업로드 (필요시 디스크로 변경)
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [HwpController],
  providers: [HwpService],
})
export class HwpModule {}
