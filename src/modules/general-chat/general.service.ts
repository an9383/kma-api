import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralEntity } from './entities/general.entity';
import { GeneralSearchListInput } from './dto/general.input';
import { GeneralUpsertInput } from './dto/general.input';
import { UpdateGeneralDto } from './dto/update-general.dto';


@Injectable()
export class GeneralService {
  private readonly log = new Logger(GeneralService.name);
  constructor(@InjectRepository(GeneralEntity) private repo: Repository<GeneralEntity>) {}

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
  async findOne(session_id: string): Promise<GeneralEntity | null> {
    return this.repo.findOne({ where: { session_id } });
  }

    /** 채팅방 수정 및 저장 */
  async upsert(sessionId: GeneralUpsertInput['session_id'], body: GeneralUpsertInput): Promise<GeneralEntity> {
    this.log.log({ sessionId, body });
    const existing = await this.repo.findOne({ where: { session_id: sessionId } });
    if (existing) {
      this.repo.merge(existing, {
        user_id: body.user_id,
        room_name: body.room_name,
        updated_at: new Date(),
      });
      return this.repo.save(existing);
    }

    const newUser = this.repo.create({
      session_id: sessionId,
      room_name: body.room_name,
      user_id: body.user_id,
      created_at: new Date(),
    });
    return this.repo.save(newUser);
  }
  
  /** 삭제 */
  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

}
