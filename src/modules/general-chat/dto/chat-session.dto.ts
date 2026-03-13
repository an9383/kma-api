import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class ChatSessionParamsDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'room id' })
  @IsString()
  room_id!: string; // 이전에 추출한 app_id 경로 파라미터

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'session_id' })
  @IsString()
  session_id!: string;  // 쿼리 스트링 session_id
}