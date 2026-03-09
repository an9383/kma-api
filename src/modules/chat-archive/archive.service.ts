import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveUpsertInput } from './dto/archive.input';
import { UpdateArchiveDto } from './dto/update-archive.dto';


@Injectable()
export class ArchiveService {
  private readonly log = new Logger(ArchiveService.name);
  constructor(@InjectRepository(ArchiveEntity) private repo: Repository<ArchiveEntity>) {}

  /** 목록 조회 */
  async list() {
    const qb = this.repo.createQueryBuilder('m');

      // if (startDate && endDate) {
      //   qb.andWhere('m.created_at BETWEEN :start AND :end', {
      //     start: `${startDate} 00:00:00`,
      //     end: `${endDate} 23:59:59.999`,
      //   });
      // }
      return await qb.getMany();
    }

  /** 단건 조회 (myProfile 및 상세 조회 공용) */
  async findOne(archive_id: string): Promise<ArchiveEntity | null> {
    return this.repo.findOne({ where: { archive_id } });
  }

    /** 채팅방 수정 및 저장 */
  async upsert(archiveId: ArchiveUpsertInput['archive_id'], body: ArchiveUpsertInput): Promise<ArchiveEntity> {
    this.log.log({ archiveId, body });
    const existing = await this.repo.findOne({ where: { archive_id: archiveId } });
    if (existing) {
      this.repo.merge(existing, {
        ...existing,
        app_id: body.app_id,
        room_id: body.room_id,
        last_app_name: body.last_app_name,
        last_app_type_code: body.last_app_type_code
      });
      return this.repo.save(existing);
    }

    const newUser = this.repo.create({
      archive_id: archiveId,
      app_id: body.app_id,
      room_id: body.room_id,
      last_app_name: body.last_app_name,
      last_app_type_code: body.last_app_type_code,
      question: body.question,
      answer: body.answer,
      user_id: body.user_id,
      created_at: new Date()
    });
    return this.repo.save(newUser);
  }
  
  /** 삭제 */
  async remove(archiveId: string): Promise<boolean> {
    const result = await this.repo.delete(archiveId);
    return result.affected ? result.affected > 0 : false;
  }

}
