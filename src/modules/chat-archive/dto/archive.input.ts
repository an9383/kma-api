import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, IsEmail, MinLength } from 'class-validator';
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateArchiveDto } from './create-archive.dto';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from './lower-case.transformer';
import { RoleDto } from './role.dto';
import { StatusDto } from './status.dto';

// @InputType()
// export class ArchiveSearchListInput {
//   //@Field() @IsString()  @MaxLength(50)  session_id!: string; 
//   @Field({ nullable: true }) @IsOptional() startDate?: string; 
//   @Field({ nullable: true }) @IsOptional() endDate?: string; 
// }

@InputType()
export class ArchiveUpsertInput {
  //@Field() @IsString() @MaxLength(50) archive_id!: string; 
  @Field() @IsString() @MaxLength(100) app_id!: string; 
  //@Field() @IsString() @MaxLength(200) room_id!: string; 
  @Field() @IsString() @MaxLength(50) last_app_name!: string; 
  @Field() @IsString() @MaxLength(100) last_app_type_code!: string;
  @Field() @IsString() @MaxLength(100) user_id!: string;   
  @Field() @IsString() @MaxLength(50) question!: string; 
  @Field() @IsString() @MaxLength(100) answer!: string;
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) created_at?: string; 
}

@InputType()
export class UpdateArchiveDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'App id'})
  @Field(() => String) // ✅ GraphQL 필드 인식
  @IsString()
  app_id!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'Room id'})
  @Field(() => String) // ✅ 추가
  @IsString()
  room_id!: string;

  @ApiPropertyOptional({ example: 'last_app_name', type: String, description: 'Last App Name'})
  @Field(() => String) // ✅ 추가
  @IsString()
  last_app_name!: string;

  @ApiPropertyOptional({ example: 'general', type: String, description: 'Last App Type Code'})
  @Field(() => String) // ✅ 추가
  @IsString()
  last_app_type_code!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'User id'})
  @Field(() => String) // ✅ 추가
  @IsString()
  user_id!: string;

  @ApiPropertyOptional({ example: 'question', type: String, description: 'question'})
  @Field(() => String) // ✅ 추가
  @IsString()
  question!: string;

  @ApiPropertyOptional({ example: 'answer', type: String, description: 'answer'})
  @Field(() => String) // ✅ 추가
  @IsString()
  answer!: string;
}