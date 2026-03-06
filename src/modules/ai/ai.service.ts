import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiEntity } from './entities/ai.entity';
import { AiSearchListInput } from './dto/ai.input';
import { AiUpsertInput } from './dto/ai.input';
import { UpdateAiDto } from './dto/update-ai.dto';


@Injectable()
export class AiService {
  private readonly log = new Logger(AiService.name);
  constructor(@InjectRepository(AiEntity) private repo: Repository<AiEntity>) {}

  ping() {
    return { ok: true, now: new Date().toISOString() };
  }

  // /** 목록 조회 */
  // async list(startDate?: string, endDate?: string) {
  //   const qb = this.repo.createQueryBuilder('m');

  //     if (startDate && endDate) {
  //       qb.andWhere('m.created_at BETWEEN :start AND :end', {
  //         start: `${startDate} 00:00:00`,
  //         end: `${endDate} 23:59:59.999`,
  //       });
  //     }
  //     return await qb.getMany();
  //   }

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
  async findOne(session_id: string): Promise<AiEntity | null> {
    return this.repo.findOne({ where: { session_id } });
  }

    /** 채팅방 수정 및 저장 */
  async upsert(sessionId: AiUpsertInput['session_id'], body: AiUpsertInput): Promise<AiEntity> {
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
