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
  async findOne(@Query('sub_app_id') sub_app_id: string) {
    console.log(sub_app_id);
    const items = await this.chatBotResolver.chatBot(sub_app_id);
    return { items };
  }

  // chatBotAppId로 단건 조회
  @Get('/getlist')
  async findList(@Query('user_id') user_id: string) {
    console.log(user_id);
    const items = await this.chatBotResolver.chatBotUser(user_id);
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
