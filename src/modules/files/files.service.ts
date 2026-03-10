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

  // findOne(id: FilesEntity['id']): Promise<NullableType<FilesEntity>> {
  //   return this.fileRepository.findById(id);
  // }

  // list(ids: string[]): Promise<FilesEntity[]> {
  //   return this.fileRepository.findByIds(ids);
  // }

    async list(fileList: string[]) {
    if (!fileList || fileList.length === 0) {
    return [];
  }
    const items = await this.fileRepository.find({
      // ✅ TypeORM where/order는 "엔티티 프로퍼티명"을 사용해야 함
      //    (DB 컬럼명 snake_case는 @Column({ name })로 매핑)
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
