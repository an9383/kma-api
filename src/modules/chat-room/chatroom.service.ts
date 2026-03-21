import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity } from './entities/chatroom.entity';
import { ChatRoomInput, CreateChatRoomInput, RunChatRoomInput, UpdateChatRoomDto} from './dto/chatroom.input';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Subject } from 'rxjs';
import { AxiosError } from 'axios';
import { StringDecoder } from 'string_decoder';
import * as https from 'https';


@Injectable()
export class ChatRoomService {
  private readonly log = new Logger(ChatRoomService.name);
  constructor(@InjectRepository(ChatRoomEntity) private chatRoomRepo: Repository<ChatRoomEntity>, private readonly httpService: HttpService) {}

  /** 목록 조회 */
  async list() {
    const qb = this.chatRoomRepo.createQueryBuilder('m');

      return await qb.getMany();
    }
  
  /** 단건 조회 (myProfile 및 상세 조회 공용) */
  async findOne(room_id: string): Promise<ChatRoomEntity | null> {
    return this.chatRoomRepo.findOne({ where: { room_id } });
  }

  /** 채팅방 수정 및 저장 */
  async runChatSession( stream: boolean, session_id: string, app_type: string, body: RunChatRoomInput, subject: Subject<MessageEvent>): Promise<void> {

    const baseUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/chat';

    const athenaApiUrl = `${baseUrl}/2e30b179-7ff2-4ef0-ae13-b734dc589ef3/run?stream=${stream}&session_id=${session_id}`;

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


  /** 채팅방 생성 및 수정 */
  async createChatRoom(room_id: string, body: CreateChatRoomInput): Promise<ChatRoomEntity> {
    this.log.log({ room_id, body });

    const existing = await this.chatRoomRepo.findOne({ where: { room_id: room_id } });
    let savedEntity: ChatRoomEntity;

    // 1. 기존 데이터가 있는 경우 (Update)
    if (existing) {
      this.chatRoomRepo.merge(existing, {
        user_id: body.user,
        room_name: body.name,
        updated_at: new Date(),
        description: body.description
      });
      this.log.log(existing);
      savedEntity = await this.chatRoomRepo.save(existing);
    } else {
      // 2. 새로운 데이터인 경우 (Insert)
      const newchatbot = this.chatRoomRepo.create({ 
        room_id: room_id,
        user_id: body.user,
        room_name: body.name,
        created_at: new Date(),
        description: body.description
      });
      this.log.log(newchatbot);
      savedEntity = await this.chatRoomRepo.save(newchatbot);
    }  
    return savedEntity;
  }

  /** 채팅방 수정 및 저장 */
  async upsert(room_id: string, body: UpdateChatRoomDto): Promise<ChatRoomEntity> {
    this.log.log({ room_id, body });
    const existing = await this.chatRoomRepo.findOne({ where: { room_id: room_id } });
    if (existing) {
      this.chatRoomRepo.merge(existing, {
        user_id: body.user_id,
        room_name: body.name,
        app_id: body.app_id,
        updated_at: new Date(),
        description: body.description
      });
      return this.chatRoomRepo.save(existing);
    }

    const newUser = this.chatRoomRepo.create({
      room_id: room_id,
      user_id: body.user_id,
      room_name: body.name,
      app_id: body.app_id,
      created_at: new Date(),
      description: body.description
    });
    return this.chatRoomRepo.save(newUser);
  }
  
  /** 삭제 */
  async remove(room_id: string): Promise<boolean> {
    const result = await this.chatRoomRepo.delete(room_id);
    return result.affected ? result.affected > 0 : false;
  }

}
