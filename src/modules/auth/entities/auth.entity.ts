import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'users' }) // 사용자 마스터 정보
export class AuthEntity {
  @Field()
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 50 })
  user_id!: string; // 사용자 ID

  @Field()
  @Column({ name: 'password', type: 'varchar', length: 200 })
  password!: string; // 사용자 PW
}
