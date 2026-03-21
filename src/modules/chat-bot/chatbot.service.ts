import { Injectable, Logger, Inject, MessageEvent, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatBotEntity} from './entities/chatbot.entity';
import { ChatRoomEntity} from '../chat-room/entities/chatroom.entity';
import {ChatBotUpsertInput, ChatSessionInput } from './dto/chatbot.input';
//import { ChatRoomUpsertInput } from './dto/chatroom.input';
import { CACHE_KEY_METADATA, CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { Cache } from 'cache-manager';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Subject } from 'rxjs';
import { AxiosError } from 'axios';
import { StringDecoder } from 'string_decoder';
import * as https from 'https';


@Injectable()
export class ChatBotService {
  private readonly log = new Logger(ChatBotService.name);
  constructor(@InjectRepository(ChatBotEntity) private chatBotRepo: Repository<ChatBotEntity>,
              @InjectRepository(ChatRoomEntity) private chatRoomRepo: Repository<ChatRoomEntity>,
              @Inject(CACHE_MANAGER) private cacheManager: Cache, 
              private readonly httpService: HttpService) {}

  /** 목록 조회 */
  async list() {
    const queryBuilder = this.chatBotRepo.createQueryBuilder('m');
      return await queryBuilder.getMany();
    }

  /** 앱 타입별 목록 조회 */
  async appTypeList(app_type_code: string) {
    const queryBuilder = this.chatBotRepo.createQueryBuilder('m');
    queryBuilder.where('m.app_type_code = :app_type_code', { app_type_code: app_type_code });

    console.log(queryBuilder.getQuery());
    console.log(queryBuilder.getParameters());

        // 2. 쿼리 실행 및 결과 저장
    const result = await queryBuilder.getMany(); 
    console.log(result);

    // 3. 결과 반환
    return result; 
  }

  async findMyList(userId: string) {
    // 1. 쿼리 빌더 생성
    const queryBuilder = this.chatBotRepo
      .createQueryBuilder('app')
      .where('(app.app_type_code = :assistantType AND app.user_id = :userId)', {
        assistantType: 'assistant',
        userId: String(userId), 
      });

    console.log(queryBuilder.getQuery());
    console.log(queryBuilder.getParameters());

    // 2. 쿼리 실행 및 결과 저장
    const result = await queryBuilder.getMany(); 
    //console.log(result);

    if (!result || result.length === 0) {
      throw new NotFoundException(`사용자(${userId})의 assistant 앱을 찾을 수 없습니다.`);
    }

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

    const result = await this.chatBotRepo.findOne({ where: { sub_app_id: sub_app_id } as any });

    if (result) {
      await this.cacheManager.set(cacheKey, result, 600000); //캐시 타이머 600초
    }
    console.log(result);  
    return result;
  }

  /** 채팅방 수정 및 저장 */
  async runChatSession( stream: boolean, session_id: string, app_type: string, body: ChatSessionInput, subject: Subject<MessageEvent>): Promise<void> {

    const baseUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/chat';
    let projectId = '';

    // 🌟 app_type에 따른 분기 처리
    switch (app_type) {
      case 'general': // 예: 특정 앱 타입 이름
        projectId = '2e30b179-7ff2-4ef0-ae13-b734dc589ef3';
        break;
      case 'knowledge0': // 기존 주석에 있던 다른 프로젝트 ID 할당
        projectId = '125cef24-d34c-4dc2-9a8e-b7c8dbd6561e';
        break;
      case 'knowledge1': // 기존 주석에 있던 다른 프로젝트 ID 할당
        projectId = '62e43af3-d395-45a9-9041-0b106001c5f1';
        break;
      case 'knowledge2': // 기존 주석에 있던 다른 프로젝트 ID 할당
        projectId = '125cef24-d34c-4dc2-9a8e-b7c8dbd6561e';
        break;
      case 'knowledge3': // 기존 주석에 있던 다른 프로젝트 ID 할당
        projectId = '125cef24-d34c-4dc2-9a8e-b7c8dbd6561e';
        break;
      default:
        projectId = '2e30b179-7ff2-4ef0-ae13-b734dc589ef3';
        console.warn(`🚧 [알 수 없는 app_type]: ${app_type}. 기본 projectId를 사용합니다.`);
        break;
    }

    const athenaApiUrl = `${baseUrl}/${projectId}/run?stream=${stream}&session_id=${session_id}`;

    try {
      const athenaAuthUrl = process.env.ATHENA_AUTH_URL as string;
      const Email = process.env.ATHENA_ADMIN_EMAIL as string;
      const Password = process.env.ATHENA_ADMIN_PASSWORD as string;

      let json;
      const res = await firstValueFrom(
        this.httpService.post(athenaAuthUrl, {
          email: Email,
          password: Password,
        })
      );

      json = res.data; 
      const token = json?.data?.access_token || json?.access_token; 

      if (!token) {
        throw new Error('토큰을 찾을 수 없습니다. Auth API 응답 구조를 확인하세요.');
      }
      
      const response = await this.httpService.axiosRef.post(
          athenaApiUrl,
          {
            output_type: body.output_type,
            input_type: body.input_type,
            input_value: body.input_value
          },
          {
            responseType: 'stream',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            }
          }
      );
      const decoder = new StringDecoder('utf8'); 
      let buffer = '';

      response.data.on('data', (chunk: Buffer) => {
        buffer += decoder.write(chunk);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line) continue;

          try {
            const parsedJson = JSON.parse(line); 

            // if (parsedJson.event === 'end') {

            //   const fullSessionId = parsedJson.data?.result?.session_id;

            //   const startAppIndex = fullSessionId.indexOf('app=') + 4;
            //   const endAppIndex = fullSessionId.indexOf('-sf=', startAppIndex);
            //   const appValue = fullSessionId.substring(startAppIndex, endAppIndex);

            //   const sfValue = fullSessionId.split('-sf=')[1];
                
            //   console.log('====================================');
            //   console.log('🏁 [전체 Session ID]:', fullSessionId);
            //   console.log('🎯 [추출된 app 값]:', appValue);
            //   console.log('🎯 [추출된 sf 값]:', sfValue);
            //   console.log('====================================');
              
            //   // this.upsertApps(appValue, app_type);
            //   // this.upsertRooms(sfValue, appValue);
            // }

            // 클라이언트로 데이터 전송
            subject.next({ 
              data: parsedJson.data,
              type: parsedJson.event 
            }); 
              
          } catch (error) {
            console.error('🚧 [JSON 파싱 에러 - 무시하고 진행]:', line);
          }
        }
      });

      // 4. 외부 API 스트림 전송이 완료되면 클라이언트와의 연결도 정상 종료
      response.data.on('end', () => {
        buffer += decoder.end(); 
        if (buffer.trim()) {
          try { 
            subject.next({ data: JSON.parse(buffer) });
          } catch(e) { 
            console.error('🚨 [End 버퍼 파싱 에러]:', (e as Error).message); 
          }
        }
        console.log(subject)
        subject.complete();
      });

      response.data.on('error', (err: Error) => {
        console.error('🔥 [Axios 스트림 에러]:', err.message);
        subject.error(err);
      });
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

/** 앱 생성 및 수정 */
  async upsertApps(app_id: string, app_type: string): Promise<ChatBotEntity> {
    this.log.log({ app_id, app_type});

    const existing = await this.chatBotRepo.findOne({ where: { app_id: app_id } });
    let savedEntity: ChatBotEntity;

    // 1. 기존 데이터가 있는 경우 (Update)
    if (existing != null) {
      this.log.log(existing);
      savedEntity = existing;
    } else {
      const newchatbot = this.chatBotRepo.create({ 
        app_id: app_id,
        app_type_code: app_type,
        created_at: new Date() 
      });
      this.log.log(newchatbot);
      savedEntity = await this.chatBotRepo.save(newchatbot);
    }
    return savedEntity;
  }

  /** 앱 생성 및 수정 */
  async upsertRooms(room_id: string, app_id: string): Promise<ChatRoomEntity> {
    this.log.log({ room_id });

    const existing = await this.chatRoomRepo.findOne({ where: { room_id: room_id } });
    let savedEntity: ChatRoomEntity;

    // 1. 기존 데이터가 있는 경우 (Update)
    if (existing != null) {
      this.log.log(existing);
      savedEntity = existing;
    } else {
      const newchatbot = this.chatRoomRepo.create({ 
        room_id: room_id,
        app_id: app_id,
        created_at: new Date() 
      });
      savedEntity = await this.chatRoomRepo.save(newchatbot);
    }
    return savedEntity;
  }

  // /** 채팅방 생성 및 수정 */
  // async createChatRoom(room_id: string, body: ChatRoomUpsertInput): Promise<ChatRoomEntity> {
  //   this.log.log({ room_id, body });

  //   const existing = await this.chatRoomRepo.findOne({ where: { room_id: room_id } });
  //   let savedEntity: ChatRoomEntity;

  //   // 1. 기존 데이터가 있는 경우 (Update)
  //   if (existing) {
  //     this.chatRoomRepo.merge(existing, {
  //       user_id: body.user_id,
  //       room_name: body.name,
  //       updated_at: new Date()
  //     });
  //     this.log.log(existing);
  //     savedEntity = await this.chatRoomRepo.save(existing);
  //   } else {
  //     // 2. 새로운 데이터인 경우 (Insert)
  //     const newchatbot = this.chatRoomRepo.create({ 
  //       room_id: room_id,
  //       user_id: body.user_id,
  //       room_name: body.name,
  //       created_at: new Date() 
  //     });
  //     this.log.log(newchatbot);
  //     savedEntity = await this.chatRoomRepo.save(newchatbot);
  //   }
        
  //   return savedEntity;
  // }
  
  /** 삭제 */
  async remove(room_id: string): Promise<boolean> {
    const result = await this.chatBotRepo.delete({ app_id: room_id } );
    const isDeleted = result.affected ? result.affected > 0 : false;
    //return result.affected ? result.affected > 0 : false;

    if (isDeleted) {  
      // 2. 삭제된 해당 앱의 단건 캐시 삭제 (findOne에 반영)
      await this.cacheManager.del(`chatbot_detail_${room_id}`);
    }

    return isDeleted;

  }

}
