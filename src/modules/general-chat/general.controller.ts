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

  // 목록조회
  @Get()
  async list() {
    const items = await this.generalResolver.list();
    return { items };
  }

   // sessionId로 단건 조회
  @Get(':room_id')
  async findOne(@Param('room_id') room_id: string) {
    const items = await this.generalResolver.general(room_id);
    return { items };
  }

  @Post(':room_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'room_id', type: String, required: true})
  async update(
    @Param('room_id') room_id: GeneralEntity['room_id'],
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

  @Post('/run/:room_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'room_id', type: String, required: true})
  runChatSession(@Param('room_id') room_id: string, @Query('session_id') session_id: string) {
    this.logger.log({ room_id, session_id}); // "125cef24-d34c-4dc2-9a8e-b7c8dbd6561e"

    //return { success: true, room_id };
    return this.generalResolver.generalChatSession(room_id, session_id);
  }

  @Delete(':room_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'room_id', type: String, required: true})
  async delete(
    @Param('room_id') room_id: string) {
    this.logger.log({ room_id});
    const items = await this.generalResolver.generalDelete(room_id);
    return { items };
  }
}
