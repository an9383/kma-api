import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, MaxLength, IsNotEmpty, IsObject } from 'class-validator';
import { PartialType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

@InputType()
export class ChatRoomInput {
  @Field() @IsString()  @MaxLength(20) room_id!: string; 
  @Field() @IsString()  @MaxLength(100)  user_id!: string; 
  @Field() @IsString()  @MaxLength(255)  room_name!: string; 
  @Field({ nullable: true }) @IsString()  @MaxLength(100)  app_id!: string; 
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) created_at?: string; 
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) updated_at?: string; 
}

@InputType() 
export class RunChatRoomInput {
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

  @ApiProperty({ example: '최근 뉴스 알려줘' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  input_value!: string;

  @ApiProperty({ example: 'usr=6350811d-19eb-4038-b7f5-1e919825dadc-pj=cce978e9-aceb-4ff7-b913-fa48e4e1f392-app=2e30b179-7ff2-4ef0-ae13-b734dc589ef3-sf=v9B2mQxP7yL1dWkR' })
  @Field(() => String) 
  @IsString()
  @IsOptional()
  session_id?: string;
}

@InputType()
export class CreateChatRoomInput { 
  @ApiProperty({ example: 'workflow' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  mode!: string;

  @ApiProperty({ example: 'test_room1' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'test_room' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: false })
  @Field(() => Boolean) 
  @IsBoolean()
  @IsOptional()
  favorite!: boolean;

  @ApiProperty({ example: 'chat' })
  @Field(() => String) 
  @IsString()
  @IsNotEmpty()
  user!: string;
}

@InputType()
export class UpdateChatRoomDto {
  @ApiPropertyOptional({ example: '1', type: String, description: 'User id' })
  @Field(() => String)
  @IsString()
  @IsOptional()
  user_id!: string;

  @ApiPropertyOptional({ example: 'test_room', type: String, description: 'Room name' })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'App id' })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  app_id!: string;

  @ApiPropertyOptional({ example: '1', type: String, description: 'description' })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description!: string;
}

