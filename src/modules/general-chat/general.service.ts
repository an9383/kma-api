import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralEntity } from './entities/general.entity';
import { GeneralUpsertInput } from './dto/general.input';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {ChatSessionParamsDto} from './dto/chat-session.dto';
import { AxiosError } from 'axios';


@Injectable()
export class GeneralService {
  private readonly log = new Logger(GeneralService.name);
  constructor(@InjectRepository(GeneralEntity) private repo: Repository<GeneralEntity>, private readonly httpService: HttpService) {}

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
  async findOne(room_id: string): Promise<GeneralEntity | null> {
    return this.repo.findOne({ where: { room_id } });
  }

  /** 채팅방 수정 및 저장 */
  async runChatSession({ room_id, session_id }: ChatSessionParamsDto): Promise<GeneralEntity> {
  this.log.log(`요청된 Room ID: ${room_id}`);
  this.log.log(`요청된 Session ID: ${session_id}`);

  // 1. 동적 URL 및 쿼리 스트링 구성
  // (호스트 주소는 환경 변수(ConfigService)로 분리하는 것을 권장합니다)
  const baseUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/chat';
  const athenaApiUrl = `${baseUrl}/${room_id}/run?stream=false&session_id=${session_id}`;

  try {
    const athenaUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/auth/token/direct'; 

    let json;
    const res = await firstValueFrom(
      this.httpService.post(athenaUrl, {
        "email": 'admin@uracle.co.kr',
        "password": 'qwer1234!'
      })
    );
    json = res.data; 
    console.log('✅ [디버깅] Auth API 응답 전체:', JSON.stringify(json, null, 2));
    const token = json?.data?.access_token || json?.access_token; 
    console.log('✅ [디버깅] 추출된 토큰 값:', token);

    // 토큰이 없으면 강제로 에러를 발생시켜 어디서 문제인지 명확히 합니다.
    if (!token) {
      throw new Error('토큰을 찾을 수 없습니다. Auth API 응답 구조를 확인하세요.');
    }

    const response = await firstValueFrom(
      this.httpService.post(
        athenaApiUrl, 
        {
          "output_type": "chat",
          "input_type": "chat",
          "input_value": "최근 뉴스 알려줘"
        }, 
        {   
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      )
    );
    console.log(response);

    return response.data;
  } catch (error) {
      if (error instanceof AxiosError) {
        this.log.error(
          'Athena API 통신 에러:', 
          error.response?.data || error.message
        );
      } else {
        const standardError = error as Error;
        this.log.error('알 수 없는 에러:', standardError.message);
      }
      
      throw error;
  }
}

  /** 채팅방 수정 및 저장 */
  async upsert(room_id: GeneralUpsertInput['room_id'], body: GeneralUpsertInput): Promise<GeneralEntity> {
    this.log.log({ room_id, body });
    const existing = await this.repo.findOne({ where: { room_id: room_id } });
    if (existing) {
      this.repo.merge(existing, {
        user_id: body.user_id,
        room_name: body.room_name,
        app_id: body.app_id,
        updated_at: new Date(),
      });
      return this.repo.save(existing);
    }

    const newUser = this.repo.create({
      room_id: room_id,
      user_id: body.user_id,
      room_name: body.room_name,
      app_id: body.app_id,
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
