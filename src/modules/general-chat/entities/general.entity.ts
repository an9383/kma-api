import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'chat_rooms' }) // 사용자 마스터 정보
export class GeneralEntity {
  @Field()
  @PrimaryColumn({ name: 'room_id', type: 'varchar', length: 50 })
  room_id!: string; // 세션 ID

  @Field()
  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  user_id!: string; // 사용자 ID

  @Column({ name: 'room_name', type: 'varchar', length: 50 })
  room_name!: string; // 채팅방 이름

  // @Field({ nullable: true })
  // @Column({ name: 'reg_id', type: 'varchar', length: 50, nullable: true })
  // reg_id!: string; // 최초 생성자

  @Field({ nullable: true })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  created_at!: Date; // 생성일자

  // @Field({ nullable: true })
  // @Column({ name: 'mod_id', type: 'varchar', length: 50, nullable: true })
  // mod_id!: string; // 최종 수정자

  @Field({ nullable: true })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updated_at!: Date; // 수정일자
}
