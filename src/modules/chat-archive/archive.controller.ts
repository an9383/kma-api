import { Controller, Req, Get, Post, Put, Patch, Delete, Body, Query, Param, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveUpsertInput, UpdateArchiveDto } from './dto/archive.input';
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
  @Get('/get')
  async findOne(@Query('session_id') room_id: string) {
    const items = await this.archiveResolver.archive(room_id);
    return { items };
  }

  @Post('/upsert')
  @HttpCode(HttpStatus.OK)
  async update(
    @Query('session_id') room_id: string,
    @Body() dto: ArchiveUpsertInput 
  ): Promise<ArchiveEntity> {
    const { app_id, last_app_name, last_app_type_code, question, answer, user_id } = dto;
    this.logger.log({ app_id, room_id, last_app_name, last_app_type_code, question, answer, user_id });
    
    // ✅ 2. 객체를 새로 만들지 말고 dto 변수를 그대로 넘깁니다!
    return this.archiveResolver.archiveUpsert(room_id, dto); 
  }

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Query('session_id') room_id: string) {
    this.logger.log({ room_id});
    const items = await this.archiveResolver.archiveDelete(room_id);
    return { items };
  }
}
