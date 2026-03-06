import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'kma_usr_m' }) // 사용자 마스터 정보
export class UserEntity {
  @Field()
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 20 })
  id!: string; // 사용자 ID

  @Field()
  @Column({ name: 'name', type: 'varchar', length: 50 })
  name!: string; // 성명

  @Field({ nullable: true })
  @Column({ name: 'dept', type: 'varchar', length: 50, nullable: true })
  dept!: string; // 부서명

  @Field({ nullable: true })
  @Column({ name: 'telno', type: 'varchar', length: 50, nullable: true })
  telno!: string; // 전화번호

  // DB에 저장된 비밀번호 해시값 (보안상 GraphQL 필드는 제외), 검증용으로만 사용
  @Column({ name: 'pswd', type: 'varchar', length: 255, nullable: true })
  pswd!: string;

  @Field({ nullable: true })
  @Column({ name: 'reg_id', type: 'varchar', length: 50, nullable: true })
  reg_id!: string; // 최초 생성자

  @Field({ nullable: true })
  @CreateDateColumn({ name: 'reg_dt', type: 'timestamp', precision: 6 })
  reg_dt!: Date; // 등록일시

  @Field({ nullable: true })
  @Column({ name: 'mod_id', type: 'varchar', length: 50, nullable: true })
  mod_id!: string; // 최종 수정자

  @Field({ nullable: true })
  @UpdateDateColumn({ name: 'mod_dt', type: 'timestamp', precision: 6 })
  mod_dt!: Date; // 수정일시
}
