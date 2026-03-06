import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'archives' }) // 사용자 마스터 정보
export class ArchiveEntity {
  @Field()
  @PrimaryColumn({ name: 'archive_id', type: 'varchar', length: 50 })
  archive_id!: string; // 세션 ID

  @Field()
  @Column({ name: 'app_id', type: 'varchar', length: 100 })
  app_id!: string; // 사용자 ID

  @Field()
  @Column({ name: 'room_id', type: 'varchar', length: 200})
  room_id!: string; // 채팅방 이름

  @Field()
  @Column({ name: 'last_app_name', type: 'varchar', length: 200})
  last_app_name!: string; // 최초 생성자

  @Field()
  @Column({ name: 'last_app_type_code', type: 'varchar', length: 50})
  last_app_type_code!: string; // 최초 생성자

  @Field()
  @Column({ name: 'user_id', type: 'varchar', length: 20})
  user_id!: string; // 사용자 ID

  @Field({ nullable: false })
  @Column({ name: 'question', type: 'text', nullable: false })
  question!: string; // 채팅방 이름

  @Field({ nullable: false })
  @Column({ name: 'answer', type: 'text', nullable: false })
  answer!: string; // 최초 생성자

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
  created_at!: Date; // 생성일자
}
