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
  async findOne(room_id: string): Promise<ArchiveEntity | null> {
    return this.repo.findOne({ where: { room_id: room_id } });
  }

  
  /** 채팅방 수정 및 저장 */
    async upsert(room_id: string, body: ArchiveUpsertInput): Promise<ArchiveEntity> {
      this.log.log({ room_id, body });
      
      const existing = await this.repo.findOne({ where: { room_id: room_id } });

      // 1. 기존 데이터가 있는 경우 (Update)
      if (existing) {
        this.repo.merge(existing, {
          app_id: body.app_id,
          room_id: room_id,
          last_app_name: body.last_app_name,
          last_app_type_code: body.last_app_type_code,
          // 🚨 누락되었던 필드 추가 (값이 들어왔을 때만 덮어씌우도록 처리)
          ...(body.question && { question: body.question }),
          ...(body.answer && { answer: body.answer }),
          ...(body.user_id && { user_id: body.user_id }),
        });
        this.log.log(existing);
        return this.repo.save(existing);
      } else {
        // 2. 새로운 데이터인 경우 (Insert)
        const newArchive = this.repo.create({ // newUser -> newArchive로 이름 변경
          // archive_id: archive_id,
          app_id: body.app_id,
          room_id: room_id,
          last_app_name: body.last_app_name,
          last_app_type_code: body.last_app_type_code,
          user_id: body.user_id,
          question: body.question,
          answer: body.answer,
          created_at: new Date() // 참고: Entity 파일에 @CreateDateColumn()을 쓰면 이 줄도 생략 가능합니다.
        });
        this.log.log(newArchive);
        return this.repo.save(newArchive);
      }


    }
  
  /** 삭제 */
  async remove(room_id: string): Promise<boolean> {
    const result = await this.repo.delete({ room_id: room_id } );
    return result.affected ? result.affected > 0 : false;
  }

}
