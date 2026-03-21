import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'chat_rooms' }) // 사용자 마스터 정보
export class ChatRoomEntity {
  @Field()
  @PrimaryColumn({ name: 'room_id', type: 'varchar', length: 50 })
  room_id!: string; // 세션 ID

  @Field()
  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  user_id!: string; // 사용자 ID

  @Column({ name: 'room_name', type: 'varchar', length: 50 })
  room_name!: string; // 채팅방 이름

  @Column({ name: 'app_id', type: 'varchar', length: 50 })
  app_id!: string; // 앱 ID

  @Field({ nullable: true })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  created_at!: Date; // 생성일자

  @Field({ nullable: true })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
  updated_at!: Date; // 수정일자

  @Field({ nullable: true })
  @Column({ name: 'description', type: 'varchar', length: 200 })
  description!: string; // 부연설명
}
