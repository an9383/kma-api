import { Controller, Req, Get, Post, Sse, MessageEvent, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode, Patch} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatRoomService } from './chatroom.service';
import { ChatRoomEntity } from './entities/chatroom.entity';
import { ChatRoomInput, RunChatRoomInput, CreateChatRoomInput, UpdateChatRoomDto } from './dto/chatroom.input';
import { ChatRoomResolver } from './chatroom.resolver';
import { Subject, Observable } from 'rxjs';


@ApiTags('api/v1/chat')
@Controller('api/v1/chat')
export class ChatRoomController {
  private readonly logger = new Logger(ChatRoomController.name);
  constructor(private readonly chatRoomResolver: ChatRoomResolver, private readonly chatRoomService: ChatRoomService) {}

  // 목록조회
  @Get()
  async list() {
    const items = await this.chatRoomResolver.list();
    return { items };
  }

   // sessionId로 단건 조회
  @Get('/sessions')
  async findOne(@Query('session_id') room_id: string) {
    const items = await this.chatRoomResolver.general(room_id);
    return { items };
  }

  @Patch('/session/:session_id')
  @HttpCode(HttpStatus.OK)
  async updateChat(
    @Param('session_id') room_id: string,
    @Body() body: UpdateChatRoomDto): Promise<ChatRoomEntity> {
    const { user_id, name, app_id, description } = body;
    this.logger.log({ room_id, user_id, name, app_id, description });
    return this.chatRoomResolver.chatRoomUpsert(room_id, {
      user_id: user_id,
      name: name,
      app_id: app_id,
      description: description
    });
  }

  @Delete('/session/:session_id')
  @HttpCode(HttpStatus.OK)
  async deleteChat(
    @Param('session_id') room_id: string) {
    this.logger.log({ room_id });
    const items = await this.chatRoomResolver.chatRoomDelete(room_id);
    return { items };
  }

  @Post('/session')
  @HttpCode(HttpStatus.OK)
  createChatSession(@Query('session_id') room_id: string, @Body() body: CreateChatRoomInput) {
    // 서비스 로직 실행 (통을 넘겨주어 서비스에서 데이터를 채워 넣도록 함)
    const items = this.chatRoomService.createChatRoom(room_id, body);
  
    return { items };
  }

  @Post('/ask')
  @HttpCode(HttpStatus.OK)
  @Sse()
  runChatSession(@Query('stream') stream: boolean, @Query('session_id') session_id: string, @Query('app_type') app_type: string,  @Body() body: RunChatRoomInput): Observable<MessageEvent> {
    // 데이터 스트림을 담을 통(Subject) 생성
    const subject = new Subject<MessageEvent>();

    // 서비스 로직 실행 (통을 넘겨주어 서비스에서 데이터를 채워 넣도록 함)
    this.chatRoomService.runChatSession(stream, session_id, app_type, body, subject);

    // 프론트엔드로는 관찰 가능한 형태(Observable)로 반환
    return subject.asObservable();
  }


}
