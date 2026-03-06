import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchiveEntity } from './entities/archive.entity'; 
import { ArchiveResolver } from './archive.resolver';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArchiveEntity])], 
  controllers: [ArchiveController],
  providers: [ArchiveResolver, ArchiveService],
  exports: [ArchiveService],
})
export class ArchiveModule {}