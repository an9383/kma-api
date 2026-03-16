import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatBotService } from './chatbot.service';
import { ChatBotEntity } from './entities/chatbot.entity';
import { ChatBotUpsertInput, UpdateChatBotDto } from './dto/chatbot.input';
import { ChatBotResolver } from './chatbot.resolver';

@ApiTags('api/chatbot')
@Controller('api/chatbot')
export class ChatBotController {
  private readonly logger = new Logger(ChatBotController.name);
  constructor(private readonly chatBotResolver: ChatBotResolver) {}

  // 목록조회
  @Get()
  async list() {
    const items = await this.chatBotResolver.chatBotList();
    return { items };
  }

  // 타입별목록조회
  @Get('/typelist')
  async appList(@Query('app_type_code') app_type_code: string) {
    const items = await this.chatBotResolver.chatBotTypeList(app_type_code);
    return { items };
  }

   // chatBotAppId로 단건 조회
  @Get('/get')
  async findOne(@Query('app_id') app_id: string) {
    const items = await this.chatBotResolver.chatBot(app_id);
    return { items };
  }

  @Post('/upsert')
  @HttpCode(HttpStatus.OK)
  async update(
    @Query('session_id') room_id: string,
    @Body() dto: ChatBotUpsertInput 
  ): Promise<ChatBotEntity> {
    const { input_type, input_value, app_name, app_type_code, user_id, app_description, is_active } = dto;
    this.logger.log({ input_type, input_value, app_name, app_type_code, user_id, app_description, is_active });
    
    // ✅ 2. 객체를 새로 만들지 말고 dto 변수를 그대로 넘깁니다!
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
