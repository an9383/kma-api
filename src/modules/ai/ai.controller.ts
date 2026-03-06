import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiEntity } from './entities/ai.entity';
import { AiSearchListInput, AiUpsertInput } from './dto/ai.input';
import { UpdateAiDto } from './dto/update-ai.dto';
import { AiResolver } from './ai.resolver';

@ApiTags('api/ai')
@Controller('api/ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly aiResolver: AiResolver, private readonly aiService: AiService) {}

  // @Get()
  // ping() {
  //   return { ok: true, now: new Date().toISOString() };
  // }

  // @Get()
  // async convert() {
  //   const html = await this.aiService.ping();
  //   return { ok: true, html };
  // }

  // 목록조회
  @Get()
  async list() {
    const items = await this.aiResolver.aiList();
    return { items };
  }

   // sessionId로 단건 조회
  @Get(':sessionId')
  async findOne(@Param('sessionId') sessionId: string) {
    const items = await this.aiResolver.ai(sessionId);
    return { items };
  }

  @Post(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sessionId', type: String, required: true})
  async update(
    @Param('sessionId') sessionId: AiEntity['session_id'],
    @Body() dto: UpdateAiDto): Promise<AiEntity> {
    const { room, user_id } = dto;
    this.logger.log({ sessionId, room, user_id });
    return this.aiResolver.aiUpsert(sessionId, {
      session_id: sessionId,
      room_name: room,
      user_id: user_id,
    });
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sessionId', type: String, required: true})
  async delete(
    @Param('sessionId') sessionId: string) {
    this.logger.log({ sessionId});
    const items = await this.aiResolver.aiDelete(sessionId);
    return { items };
  }


}
