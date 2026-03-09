import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { GeneralService } from './general.service';
import { GeneralEntity } from './entities/general.entity';
import { GeneralSearchListInput, GeneralUpsertInput } from './dto/general.input';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { GeneralResolver } from './general.resolver';

@ApiTags('api/general')
@Controller('api/general')
export class GeneralController {
  private readonly logger = new Logger(GeneralController.name);
  constructor(private readonly generalResolver: GeneralResolver, private readonly generalService: GeneralService) {}

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
    const items = await this.generalResolver.aiList();
    return { items };
  }

   // sessionId로 단건 조회
  @Get(':sessionId')
  async findOne(@Param('sessionId') sessionId: string) {
    const items = await this.generalResolver.general(sessionId);
    return { items };
  }

  @Post(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sessionId', type: String, required: true})
  async update(
    @Param('sessionId') sessionId: GeneralEntity['session_id'],
    @Body() dto: UpdateGeneralDto): Promise<GeneralEntity> {
    const { room, user_id } = dto;
    this.logger.log({ sessionId, room, user_id });
    return this.generalResolver.generalUpsert(sessionId, {
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
    const items = await this.generalResolver.generalDelete(sessionId);
    return { items };
  }
}
