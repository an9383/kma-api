import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, IsEmail, MinLength } from 'class-validator';
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAiDto } from './create-ai.dto';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from './lower-case.transformer';
import { RoleDto } from './role.dto';
import { StatusDto } from './status.dto';

@InputType()
export class AiSearchListInput {
  //@Field() @IsString()  @MaxLength(50)  session_id!: string; 
  @Field({ nullable: true }) @IsOptional() startDate?: string; 
  @Field({ nullable: true }) @IsOptional() endDate?: string; 
}

@InputType()
export class AiUpsertInput {
  @Field() @IsString()  @MaxLength(50) session_id!: string; 
  @Field() @IsString()  @MaxLength(50)  user_id!: string; 
  @Field() @IsString()  @MaxLength(50)  room_name!: string; 
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) created_at?: string; 
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) updated_at?: string; 
}

export class UpdateUserDto extends PartialType(CreateAiDto) {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  // @ApiPropertyOptional({ type: () => FileDto })
  // @IsOptional()
  // photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;
}
