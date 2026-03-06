import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

// 회원 정보를 새로 만들거나 수정할 때 사용하는 약속된 규격입니다
@InputType()
export class MemberUpsertInput {
  @Field() @IsString() @MaxLength(20) userId!: string;
  @Field() @IsString() @MaxLength(50) userName!: string;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() age?: number;
  @Field({ nullable: true }) @IsOptional() @IsString() content?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() fileGrpId?: string;
}

// 목록을 조회할 때 필터링할 조건들을 모아둔 규격입니다
@InputType()
export class MemberSearchInput {
  @Field({ nullable: true }) @IsOptional() keyword?: string;
  @Field({ nullable: true }) @IsOptional() startDate?: string;
  @Field({ nullable: true }) @IsOptional() endDate?: string;
  @Field({ nullable: true }) @IsOptional() areaDiv?: string;
  @Field({ nullable: true }) @IsOptional() payDiv?: string;
  @Field({ nullable: true }) @IsOptional() boardDiv?: string;
}
