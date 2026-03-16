import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString,  IsBoolean } from 'class-validator';

export class UpdateChatBotDto {
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
