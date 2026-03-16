import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatBotEntity } from './entities/chatbot.entity';
import {ChatBotUpsertInput } from './dto/chatbot.input';
import { UpdateChatBotDto } from './dto/update-chatbot.dto';

@Injectable()
export class ChatBotService {
  private readonly log = new Logger(ChatBotService.name);
  constructor(@InjectRepository(ChatBotEntity) private repo: Repository<ChatBotEntity>) {}

  /** 목록 조회 */
  async list() {
    const qb = this.repo.createQueryBuilder('m');
      return await qb.getMany();
    }

  /** 앱 타입별 목록 조회 */
  async appTypeList(app_type_code: string) {
    const qb = this.repo.createQueryBuilder('m');
    qb.where('m.app_type_code = :app_type_code', { app_type_code: app_type_code });
    return await qb.getMany();
  }

  /** 단건 조회 (myProfile 및 상세 조회 공용) */
  async findOne(app_id: string): Promise<ChatBotEntity | null> {
    return this.repo.findOne({ where: { app_id: app_id } });
  }

  /** 채팅방 수정 및 저장 */
    async upsert(room_id: string, body: ChatBotUpsertInput): Promise<ChatBotEntity> {
      this.log.log({ room_id, body });
      const inputValue = body.input_value;

      // 1. 'app='이 시작하는 위치를 찾고, 글자 길이(4)만큼 더해서 실제 값의 시작점을 찾습니다.
      const startAppIndex = inputValue.indexOf('app=') + 4;
      const endAppIndex = inputValue.indexOf('-sf=', startAppIndex);
      const appValue = inputValue.substring(startAppIndex, endAppIndex);

      console.log(appValue);
      const existing = await this.repo.findOne({ where: { app_id: appValue } });

      // 1. 기존 데이터가 있는 경우 (Update)
      if (existing) {
        this.repo.merge(existing, {
          app_name: body.app_name,
          app_type_code: body.app_type_code,
          app_description: body.app_description,
          user_id: body.user_id,
          is_active: body.is_active
        });
        this.log.log(existing);
        return this.repo.save(existing);
      } else {
        // 2. 새로운 데이터인 경우 (Insert)
        const newchatbot = this.repo.create({ 
          app_id: appValue,
          app_name: body.app_name,
          app_type_code: body.app_type_code,
          app_description: body.app_description,
          user_id: body.user_id,
          is_active: body.is_active,
          created_at: new Date() 
        });
        this.log.log(newchatbot);
        return this.repo.save(newchatbot);
      }
    }
  
  /** 삭제 */
  async remove(room_id: string): Promise<boolean> {
    const result = await this.repo.delete({ app_id: room_id } );
    return result.affected ? result.affected > 0 : false;
  }

}
