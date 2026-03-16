import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
  IsBoolean,
} from 'class-validator';
//import { RoleDto } from './role.dto';
//import { StatusDto } from './status.dto';
import { lowerCaseTransformer } from './lower-case.transformer';

export class CreateChatBotDto {
  @ApiPropertyOptional({ example: 'general', type: String, description: 'App Type Code' })
  @IsString()
  app_type_code?: string | null;

  @ApiPropertyOptional({ example: 'appName', type: String, description: 'App Name' })
  @IsString()
  app_name?: string | null;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'app description', nullable: false })
  @IsOptional()
  @IsString()
  app_description!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'User id', nullable: false })
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'test_room', type: Boolean, description: 'active', nullable: false })
  @IsBoolean()
  is_active!: string;
}
