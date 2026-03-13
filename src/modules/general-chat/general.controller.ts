import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { GeneralService } from './general.service';
import { GeneralEntity } from './entities/general.entity';
import { ChatSessionInput } from './dto/general.input';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { GeneralResolver } from './general.resolver';


@ApiTags('api/general')
@Controller('api/general')
export class GeneralController {
  private readonly logger = new Logger(GeneralController.name);
  constructor(private readonly generalResolver: GeneralResolver, private readonly generalService: GeneralService) {}

  // 목록조회
  @Get()
  async list() {
    const items = await this.generalResolver.list();
    return { items };
  }

   // sessionId로 단건 조회
  @Get('/get')
  async findOne(@Query('session_id') room_id: string) {
    const items = await this.generalResolver.general(room_id);
    return { items };
  }

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  async update(
    @Query('session_id') room_id: string,
    @Body() dto: UpdateGeneralDto): Promise<GeneralEntity> {
    const { user_id, room_name, app_id } = dto;
    this.logger.log({ room_id, room_name, user_id });
    return this.generalResolver.generalUpsert(room_id, {
      room_id: room_id,
      user_id: user_id,
      room_name: room_name,
      app_id: app_id,
    });
  }

  @Post('2e30b179-7ff2-4ef0-ae13-b734dc589ef3/run')
  @HttpCode(HttpStatus.OK)
  async runChatSession(@Query('stream') stream: boolean, @Query('session_id') session_id: string, @Body() body: ChatSessionInput) {
    this.logger.log({ stream, session_id, body}); // "125cef24-d34c-4dc2-9a8e-b7c8dbd6561e"

    return this.generalResolver.generalChatSession(stream, session_id, body);
  }

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Query('session_id') room_id: string) {
    this.logger.log({ room_id});
    const items = await this.generalResolver.generalDelete(room_id);
    return { items };
  }
}
