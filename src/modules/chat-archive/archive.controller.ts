import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveSearchListInput, ArchiveUpsertInput } from './dto/archive.input';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { ArchiveResolver } from './archive.resolver';

@ApiTags('api/archive')
@Controller('api/archive')
export class ArchiveController {
  private readonly logger = new Logger(ArchiveController.name);
  constructor(private readonly archiveResolver: ArchiveResolver, private readonly archiveService: ArchiveService) {}

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
    const items = await this.archiveResolver.archiveList();
    return { items };
  }

   // sessionId로 단건 조회
  @Get(':sessionId')
  async findOne(@Param('sessionId') sessionId: string) {
    const items = await this.archiveResolver.archive(sessionId);
    return { items };
  }

  @Post(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sessionId', type: String, required: true})
  async update(
    @Param('sessionId') sessionId: ArchiveEntity['session_id'],
    @Body() dto: UpdateArchiveDto): Promise<ArchiveEntity> {
    const { room, user_id } = dto;
    this.logger.log({ sessionId, room, user_id });
    return this.archiveResolver.archiveUpsert(sessionId, {
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
    const items = await this.archiveResolver.archiveDelete(sessionId);
    return { items };
  }
}
