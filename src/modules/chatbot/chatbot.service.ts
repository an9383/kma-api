import { Injectable, Logger, Inject, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatBotEntity } from './entities/chatbot.entity';
import {ChatBotUpsertInput } from './dto/chatbot.input';
import { CACHE_KEY_METADATA, CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { Cache } from 'cache-manager';

//import { GeneralEntity } from './entities/general.entity';
import { GeneralUpsertInput, ChatSessionInput } from './dto/general.input';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Subject } from 'rxjs';
import { AxiosError } from 'axios';
import { StringDecoder } from 'string_decoder';
import * as https from 'https';


@Injectable()
export class ChatBotService {
  private readonly log = new Logger(ChatBotService.name);
  constructor(@InjectRepository(ChatBotEntity) private repo: Repository<ChatBotEntity>, @Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly httpService: HttpService) {}

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

  // async findUserList(userId: string) {
  //   const [generalAndKnowledgeApps, assistantApps] = await Promise.all([
  //     this.repo.find({
  //       where: { app_type_code: In(['general', 'knowledge']) },
  //     }),
  //     this.repo.find({
  //       where: { 
  //         app_type_code: 'assistant', 
  //         user_id: userId, 
  //       }
  //     }),
  //   ]);

  //   console.log([generalAndKnowledgeApps, assistantApps])
  //   // 두 결과 배열을 하나로 병합하여 반환
  //   return [...generalAndKnowledgeApps, ...assistantApps];
  // }

async findUserList(userId: string) {
    // 1. 쿼리 빌더 생성
    const queryBuilder = this.repo
      .createQueryBuilder('app')
      .where('app.app_type_code IN (:...types)', { types: ['general', 'knowledge'] })
      .orWhere('(app.app_type_code = :assistantType AND app.user_id = :userId)', {
        assistantType: 'assistant',
        userId: String(userId), 
      });

    console.log(queryBuilder.getQuery());
    console.log(queryBuilder.getParameters());

    // 2. 쿼리 실행 및 결과 저장
    const result = await queryBuilder.getMany(); 
    console.log(result);

    // 3. 결과 반환
    return result; 
  }

  /** 단건 조회 (myProfile 및 상세 조회 공용) */
  async findOne(sub_app_id: string): Promise<ChatBotEntity | null> {
    const cacheKey = `chatbot_detail_${sub_app_id}`; 
    console.log(cacheKey);

    const cachedData = await this.cacheManager.get<ChatBotEntity>(cacheKey);
    console.log(cachedData);
    if (cachedData) {
      return cachedData;
    }

    const result = await this.repo.findOne({ where: { sub_app_id: sub_app_id } as any });

    if (result) {
      await this.cacheManager.set(cacheKey, result, 600000); //캐시 타이머 600초
    }
    console.log(result);  
    return result;
  }

  //   /** 채팅방 수정 및 저장 */
  //   async runChatSession( stream: boolean, session_id: string, body: ChatSessionInput, subject: Subject<MessageEvent>): Promise<void> {
  
  //   const baseUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/chat';
  //   const athenaApiUrl = `${baseUrl}/2e30b179-7ff2-4ef0-ae13-b734dc589ef3/run?stream=${stream}&session_id=${session_id}`;
  
  //   try {
  //     const athenaUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/auth/token/direct'; 
  
  //     let json;
  //     const res = await firstValueFrom(
  //       this.httpService.post(athenaUrl, {
  //         "email": 'admin@uracle.co.kr',
  //         "password": 'qwer1234!'
  //       })
  //     );
  //     json = res.data; 
  //     const token = json?.data?.access_token || json?.access_token; 
  
  //     if (!token) {
  //       throw new Error('토큰을 찾을 수 없습니다. Auth API 응답 구조를 확인하세요.');
  //     }
      
  //     const response = await this.httpService.axiosRef.post(
  //         athenaApiUrl,
  //         {
  //           output_type: body.output_type,
  //           input_type: body.input_type,
  //           input_value: body.input_value
  //         },
  //         {
  //           responseType: 'stream',
  //           // timeout: 0,
  //           // // 👇 [추가] Node.js 소켓이 유휴 상태에서도 끊기지 않도록 강제 유지
  //           // httpsAgent: new https.Agent({ keepAlive: true }),
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${token}` 
  //           }
  //         }
  //     );
  //     // 남은 텍스트 조각을 임시 저장할 버퍼 변수 (청크가 잘려서 올 경우 대비)
  //     const decoder = new StringDecoder('utf8'); 
  //     let buffer = '';
  //     // 2. 외부 API에서 데이터 조각(chunk)이 도착할 때마다 실행되는 이벤트 리스너
  //     response.data.on('data', (chunk: Buffer) => {
  //         buffer += decoder.write(chunk);
          
  //         const lines = buffer.split('\n');
  //         buffer = lines.pop() || '';
  
  //         for (const line of lines) {
  //           if (line.trim() === '') continue;
  //           try {
  //             subject.next({ data: JSON.parse(line) }); 
  //           } catch (error) {
  //             console.error('🚧 [중간 Chunk 파싱 에러]:', (error as Error).message);
  //           }
  //         }
  //     });
  
  //       // 4. 외부 API 스트림 전송이 완료되면 클라이언트와의 연결도 정상 종료
  //       response.data.on('end', () => {
  //         buffer += decoder.end(); 
  //         if (buffer.trim()) {
  //            try { 
  //             subject.next({ data: JSON.parse(buffer) });
  //           } catch(e) { 
  //             console.error('🚨 [End 버퍼 파싱 에러]:', (e as Error).message); 
  //           }
  //         }
  //         subject.complete();
  //       });
  
  
  //       response.data.on('error', (err: Error) => {
  //         console.error('🔥 [Axios 스트림 에러]:', err.message);
  //         subject.error(err);
  //       });
  //   } catch (error) {
  //       if (error instanceof AxiosError) {
  //         this.log.error(
  //           'Athena API 통신 에러:', 
  //           error.response?.data || error.message
  //         );
  //       } else {
  //         const standardError = error as Error;
  //         this.log.error('알 수 없는 에러:', standardError.message);
  //       }
        
  //       throw error;
  //   }
  // }

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
      let savedEntity: ChatBotEntity;

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
        //return this.repo.save(existing);
        savedEntity = await this.repo.save(existing);
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
        //return this.repo.save(newchatbot);
        savedEntity = await this.repo.save(newchatbot);
      }
      await this.cacheManager.del(`chatbot_detail_${appValue}`);
      
      return savedEntity;
    }
  
  /** 삭제 */
  async remove(room_id: string): Promise<boolean> {
    const result = await this.repo.delete({ app_id: room_id } );
    const isDeleted = result.affected ? result.affected > 0 : false;
    //return result.affected ? result.affected > 0 : false;

    if (isDeleted) {
      
      // 2. 삭제된 해당 앱의 단건 캐시 삭제 (findOne에 반영)
      await this.cacheManager.del(`chatbot_detail_${room_id}`);
    }

    return isDeleted;

  }

}
