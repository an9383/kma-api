import { InputType, Field } from '@nestjs/graphql';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsOptional, IsBooleanString, IsObject } from 'class-validator';

// Query 파라미터용 DTO
export class ChatSessionParamsDto {
  @ApiPropertyOptional({ example: 'false', description: '스트림 여부' })
  @IsBooleanString() // 쿼리 스트링은 기본적으로 문자열이므로 Boolean 변환 검증 사용
  @IsOptional()
  stream?: boolean;

  @ApiPropertyOptional({ example: 'test_room', description: '세션 ID' })
  @IsString()
  @IsOptional()
  session_id?: string;

  @ApiPropertyOptional({ example: 'false', description: '스트림 여부' })
  @IsObject() // 쿼리 스트링은 기본적으로 문자열이므로 Boolean 변환 검증 사용
  @IsOptional()
  body?: object;
}
