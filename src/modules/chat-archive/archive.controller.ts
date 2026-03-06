import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveUpsertInput } from './dto/archive.input';
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

   // archiveId로 단건 조회
  @Get(':archiveId')
  async findOne(@Param('archiveId') archiveId: string) {
    const items = await this.archiveResolver.archive(archiveId);
    return { items };
  }

  @Post(':archiveId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'archiveId', type: String, required: true})
  async update(
    @Param('archiveId') archiveId: ArchiveEntity['archive_id'],
    @Body() dto: UpdateArchiveDto): Promise<ArchiveEntity> {
    const { app_id, room_id, last_app_name, last_app_type_code, question, answer, user_id } = dto;
    this.logger.log({ archiveId, app_id, room_id, last_app_name, last_app_type_code, question, answer, user_id });
    return this.archiveResolver.archiveUpsert(archiveId, {
      archive_id: archiveId,
      app_id: app_id,
      room_id: room_id,
      last_app_name: last_app_name,
      last_app_type_code: last_app_type_code,
      question: question,
      answer: answer,
      user_id: user_id
    });
  }

  @Delete(':archiveId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'archiveId', type: String, required: true})
  async delete(
    @Param('archiveId') archiveId: string) {
    this.logger.log({ archiveId});
    const items = await this.archiveResolver.archiveDelete(archiveId);
    return { items };
  }
}
