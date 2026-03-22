import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'User id' })
  @IsString()
  user_id!: string;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'Room name' })
  @IsString()
  password!: string;
}
