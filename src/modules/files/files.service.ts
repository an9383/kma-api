import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FilesEntity } from './entities/files.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesEntity)
    private readonly fileRepository: Repository<FilesEntity>,
  ) {}

    async list(fileList: string[]) {
    if (!Array.isArray(fileList) || fileList.length === 0) {
    return [];
    }

    const items = await this.fileRepository.find({
      where: { fileId: In(fileList), fileUseYn: 'Y' },
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
}
