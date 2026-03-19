import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'apps' }) // 테이블정보
export class ChatBotEntity {
  @Field()
  @PrimaryColumn({ name: 'app_id', type: 'varchar', length: 100 })
  app_id!: string; // APP ID

  @Field()
  @Column({ name: 'app_type_code', type: 'varchar', length: 20})
  app_type_code!: string; // APP 타입 코드( 'GENERAL'(일반), 'KNOWLEDGE'(지식), 'ASSISTANT'(비서))

  @Field()
  @Column({ name: 'app_name', type: 'varchar', length: 200})
  app_name!: string; // APP 이름

  @Field()
  @Column({ name: 'app_description', type: 'varchar', length: 200})
  app_description!: string; // 상세설명

  @Field()
  @Column({ name: 'user_id', type: 'varchar', length: 100})
  user_id!: string; // 사용자 ID

  @Field({ nullable: false })
  @Column({ name: 'is_active', type: 'boolean', nullable: false })
  is_active!: boolean; // 활성화

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  created_at!: Date; // 생성일자

  @Field()
  @CreateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updated_at!: Date; // 수정일자
}
