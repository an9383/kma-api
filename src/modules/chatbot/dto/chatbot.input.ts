import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, IsEmail, MinLength, IsBoolean, IsNotEmpty } from 'class-validator';
import { PartialType, ApiPropertyOptional, ApiProperty  } from '@nestjs/swagger';
import { CreateChatBotDto } from './create-chatbot.dto';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from './lower-case.transformer';
import { RoleDto } from './role.dto';
import { StatusDto } from './status.dto';

// @InputType()
// export class knowledgeSearchListInput {
//   //@Field() @IsString()  @MaxLength(50)  session_id!: string; 
//   @Field({ nullable: true }) @IsOptional() startDate?: string; 
//   @Field({ nullable: true }) @IsOptional() endDate?: string; 
// }

@InputType()
export class ChatBotUpsertInput { 
  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  output_type!: string;

  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  input_type!: string;

  @ApiProperty({ example: 'usr=6350811d-19eb-4038-b7f5-1e919825dadc-pj=cce978e9-aceb-4ff7-b913-fa48e4e1f392-app=2e30b179-7ff2-4ef0-ae13-b734dc589ef3-sf=v9B2mQxP7yL1dWkR' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  input_value!: string;

  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  app_name!: string;

  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  app_type_code!: string;

  @ApiProperty({ example: 'usr=6350811d-19eb-4038-b7f5-1e919825dadc-pj=cce978e9-aceb-4ff7-b913-fa48e4e1f392-app=2e30b179-7ff2-4ef0-ae13-b734dc589ef3-sf=v9B2mQxP7yL1dWkR' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  app_description!: string;

  @ApiProperty({ example: 'usr=6350811d-19eb-4038-b7f5-1e919825dadc-pj=cce978e9-aceb-4ff7-b913-fa48e4e1f392-app=2e30b179-7ff2-4ef0-ae13-b734dc589ef3-sf=v9B2mQxP7yL1dWkR' })
  @Field(() => Boolean) 
  @IsBoolean()
  @IsNotEmpty()
  is_active!: boolean;
}

@InputType()
export class UpdateChatBotDto {
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