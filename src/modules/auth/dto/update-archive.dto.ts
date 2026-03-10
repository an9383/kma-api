import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'App id'})
  @IsString()
  app_id!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'Room id'})
  @IsString()
  room_id!: string;

  @ApiPropertyOptional({ example: 'appName', type: String, description: 'Last App Name'})
  @IsString()
  last_app_name!: string;

  @ApiPropertyOptional({ example: 'general', type: String, description: 'Last App Type Code'})
  @IsString()
  last_app_type_code!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'User id'})
  @IsString()
  user_id!: string;

  @ApiPropertyOptional({ example: 'question', type: String, description: 'question'})
  @IsString()
  question!: string;

  @ApiPropertyOptional({ example: 'answer', type: String, description: 'answer'})
  @IsString()
  answer!: string;
}
