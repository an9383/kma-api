import { Controller, Req, Get, Post, Sse, MessageEvent, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatBotService } from './chatbot.service';
import { ChatBotEntity } from './entities/chatbot.entity';
import { ChatBotUpsertInput, ChatSessionInput, ChatRoomUpsertInput } from './dto/chatbot.input';
import { ChatBotResolver } from './chatbot.resolver';
import { Subject, Observable } from 'rxjs';

@ApiTags('api/v1/chat')
@Controller('api/v1/chat')
export class ChatBotController {
  private readonly logger = new Logger(ChatBotController.name);
  constructor(private readonly chatBotResolver: ChatBotResolver, private chatBotService: ChatBotService) {}

  // 목록조회
  @Get()
  async list() {
    const items = await this.chatBotResolver.chatBotList();
    return { items };
  }

  // // 타입별목록조회
  // @Get('/gettypelist')
  // async findTypeList(@Query('app_type_code') app_type_code: string) {
  //   const items = await this.chatBotResolver.chatBotTypeList(app_type_code);
  //   return { items };
  // }

   // chatBotAppId로 단건 조회
  @Get('/get')
  async findOne(@Query('sub_app_id') sub_app_id: string) {
    console.log(sub_app_id);
    const items = await this.chatBotResolver.chatBot(sub_app_id);
    return { items };
  }

  // chatBotAppId로 단건 조회
  @Get('/getmylist')
  async findMyList(@Query('user_id') user_id: string) {
    console.log(user_id);
    const items = await this.chatBotResolver.chatBotMyList(user_id);
    return { items };
  }

  @Post('/ask')
  @HttpCode(HttpStatus.OK)
  @Sse()
  runChatSession(@Query('stream') stream: boolean, @Query('session_id') session_id: string, @Query('app_type') app_type: string, @Body() body: ChatSessionInput): Observable<MessageEvent> {
    // 데이터 스트림을 담을 통(Subject) 생성
    const subject = new Subject<MessageEvent>();
  
    // 서비스 로직 실행 (통을 넘겨주어 서비스에서 데이터를 채워 넣도록 함)
    this.chatBotService.runChatSession(stream, session_id, app_type, body, subject);
  
    // 프론트엔드로는 관찰 가능한 형태(Observable)로 반환
    return subject.asObservable();
  }



  // @Post('/create')
  // @HttpCode(HttpStatus.OK)
  // createChatSession(@Query('session_id') room_id: string, @Body() body: ChatRoomUpsertInput) {
  //   // 서비스 로직 실행 (통을 넘겨주어 서비스에서 데이터를 채워 넣도록 함)
  //   const items = this.chatBotService.createChatRoom(room_id, body);
  
  //   return { items };
  // }

  @Post('/upsert')
  @HttpCode(HttpStatus.OK)
  async update(
    @Query('session_id') room_id: string,
    @Body() dto: ChatBotUpsertInput 
  ): Promise<ChatBotEntity> {
    const { input_type, input_value, app_name, app_type_code, user_id, app_description, is_active } = dto;
    this.logger.log({ input_type, input_value, app_name, app_type_code, user_id, app_description, is_active });

    return this.chatBotResolver.chatBotUpsert(room_id, dto);
  }

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Query('session_id') room_id: string) {
    this.logger.log({ room_id});
    const items = await this.chatBotResolver.chatBotDelete(room_id);
    return { items };
  }
}
