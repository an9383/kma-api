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

export class CreateArchiveDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'App id', nullable: false })
  @IsString()
  app_id!: string;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'Room id', nullable: false })
  @IsString()
  room_id?: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'Last App Name' })
  @IsOptional()
  @IsString()
  last_app_name?: string | null;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'Last App Type Code' })
  @IsOptional()
  @IsString()
  last_app_type_code?: string | null;

  @ApiPropertyOptional({ example: '1', type: String, description: 'User id', nullable: false })
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'question', nullable: false })
  @IsString()
  question!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'answer', nullable: false })
  @IsString()
  answer!: string;
}
