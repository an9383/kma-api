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
  constructor(private readonly archiveResolver: ArchiveResolver) {}

  // 목록조회
  @Get()
  async list() {
    const items = await this.archiveResolver.archiveList();
    return { items };
  }

   // archiveId로 단건 조회
  @Get(':archive_id')
  async findOne(@Param('archive_id') archive_id: string) {
    const items = await this.archiveResolver.archive(archive_id);
    return { items };
  }

  @Post(':archive_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'archive_id', type: String, required: true})
  async update(
    @Param('archive_id') archive_id: ArchiveEntity['archive_id'],
    @Body() dto: UpdateArchiveDto): Promise<ArchiveEntity> {
    const { app_id, room_id, last_app_name, last_app_type_code, question, answer, user_id } = dto;
    this.logger.log({ archive_id, app_id, room_id, last_app_name, last_app_type_code, question, answer, user_id });
    return this.archiveResolver.archiveUpsert(archive_id, {
      archive_id: archive_id,
      app_id: app_id,
      room_id: room_id,
      last_app_name: last_app_name,
      last_app_type_code: last_app_type_code,
      question: question,
      answer: answer,
      user_id: user_id
    });
  }

  @Delete(':archive_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'archive_id', type: String, required: true})
  async delete(
    @Param('archive_id') archive_id: string) {
    this.logger.log({ archive_id});
    const items = await this.archiveResolver.archiveDelete(archive_id);
    return { items };
  }
}
