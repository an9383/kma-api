import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachController } from './attach.controller';
import { AttachService } from './attach.service';
import { AttachFileEntity } from './entities/attach-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttachFileEntity])],
  controllers: [AttachController],
  providers: [AttachService],
  exports: [AttachService],
})
export class AttachModule {}
