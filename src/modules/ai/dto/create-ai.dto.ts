import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
} from 'class-validator';
//import { RoleDto } from './role.dto';
//import { StatusDto } from './status.dto';
import { lowerCaseTransformer } from './lower-case.transformer';

export class CreateAiDto {
  @ApiPropertyOptional({ example: '1', type: String })
  @Transform(lowerCaseTransformer)
  sessionId?: string | null;

  @ApiPropertyOptional({ example: 'test_room', type: String })
  @IsOptional()
  roomName?: string | null;
}
