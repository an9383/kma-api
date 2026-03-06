import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CommonCodeUpsertInput {
  @Field() @IsString() @MaxLength(50) comnCd!: string;
  @Field() @IsString() @MaxLength(255) comnNm!: string;
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) upCd?: string;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() sort?: number;
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(20) comnDiv?: string;

  // 등록/수정자 정보를 받기 위한 필드 추가 (선택사항)
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) regId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(50) modId?: string;
}
