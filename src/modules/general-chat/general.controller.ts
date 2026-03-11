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
    const items = await this.generalResolver.aiList();
    return { items };
  }

   // sessionId로 단건 조회
  @Get(':roomId')
  async findOne(@Param('roomId') roomId: string) {
    const items = await this.generalResolver.general(roomId);
    return { items };
  }

  @Post(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'roomId', type: String, required: true})
  async update(
    @Param('roomId') roomId: GeneralEntity['room_id'],
    @Body() dto: UpdateGeneralDto): Promise<GeneralEntity> {
    const { room, user_id } = dto;
    this.logger.log({ roomId, room, user_id });
    return this.generalResolver.generalUpsert(roomId, {
      room_id: roomId,
      room_name: room,
      user_id: user_id,
    });
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'roomId', type: String, required: true})
  async delete(
    @Param('roomId') roomId: string) {
    this.logger.log({ roomId});
    const items = await this.generalResolver.generalDelete(roomId);
    return { items };
  }
}
