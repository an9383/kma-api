import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralEntity } from './entities/general.entity';
import { GeneralUpsertInput, ChatSessionInput } from './dto/general.input';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Subject } from 'rxjs';
import { AxiosError } from 'axios';
import { StringDecoder } from 'string_decoder';
import * as https from 'https';


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
  async runChatSession( stream: boolean, session_id: string, body: ChatSessionInput, subject: Subject<MessageEvent>): Promise<void> {

  const baseUrl = 'https://kma-athena.dev.uracle.co.kr/api/v1/chat';
  const athenaApiUrl = `${baseUrl}/2e30b179-7ff2-4ef0-ae13-b734dc589ef3/run?stream=${stream}&session_id=${session_id}`;

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
          // timeout: 0,
          // // 👇 [추가] Node.js 소켓이 유휴 상태에서도 끊기지 않도록 강제 유지
          // httpsAgent: new https.Agent({ keepAlive: true }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
    );
    // 남은 텍스트 조각을 임시 저장할 버퍼 변수 (청크가 잘려서 올 경우 대비)
    const decoder = new StringDecoder('utf8'); 
    let buffer = '';
    // 2. 외부 API에서 데이터 조각(chunk)이 도착할 때마다 실행되는 이벤트 리스너
    response.data.on('data', (chunk: Buffer) => {
        buffer += decoder.write(chunk);
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            subject.next({ data: JSON.parse(line) }); 
          } catch (error) {
            console.error('🚧 [중간 Chunk 파싱 에러]:', (error as Error).message);
          }
        }
    });

      // response.data.on('close', () => {
      //   // 이미 end가 호출되어 stream이 닫힌 상태가 아니라면, 비정상 종료된 것임
      //   if (!subject.closed) {
      //       console.warn('⚠️ 외부 API 연결이 비정상적으로 닫혔습니다 (Close 이벤트 발생)');
      //       // 프론트엔드에게 강제로라도 end 이벤트를 보내주어 대기를 풀게 함
      //       subject.next({ 
      //           data: { event: 'end', data: { message: 'Stream closed unexpectedly' } } 
      //       });
      //       subject.complete();
      //   }
      // });

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

// /** 채팅방 수정 및 저장 */
//   async runChatSession( stream: boolean, session_id: string, body: ChatSessionInput): Promise<GeneralEntity> {

//   // 1. 동적 URL 및 쿼리 스트링 구성
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
    
//     const response = await firstValueFrom(
//       this.httpService.post(
//         athenaApiUrl, 
//         {
//           "output_type": body.output_type,
//           "input_type": body.input_type,
//           "input_value": body.input_value
//         },
//         {   
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}` 
//           }
//         }
//       )
//     );

//     return response.data;
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
