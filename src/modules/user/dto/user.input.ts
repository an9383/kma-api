import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UserUpsertInput {
  @Field()
  @IsString()
  @MaxLength(20)
  id!: string; // 로그인 ID

  @Field()
  @IsString()
  @MaxLength(50)
  name!: string; // 성명

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dept?: string; // 소속 부서

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telno?: string; // 연락처

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255) // DB varchar(255) 기준
  pswd?: string; // 비밀번호 (해시값)
}
