import { Field, Int, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'kma_com_cd_m' })
export class CommonCodeEntity {
  @Field(() => String)
  @PrimaryColumn({ name: 'comn_cd', type: 'varchar', length: 50 })
  comnCd!: string;

  @Field(() => String)
  @Column({ name: 'comn_nm', type: 'varchar', length: 255 })
  comnNm!: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'up_cd', type: 'varchar', length: 50, nullable: true })
  upCd!: string | null;

  @Field(() => Int)
  @Column({ name: 'sort', type: 'int', default: 0 })
  sort!: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'comn_div', type: 'varchar', length: 20, nullable: true })
  comnDiv!: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'reg_id', type: 'varchar', length: 50, nullable: true })
  regId!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn({ name: 'reg_dt', type: 'timestamp', nullable: true })
  regDt!: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'mod_id', type: 'varchar', length: 50, nullable: true })
  modId!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn({ name: 'mod_dt', type: 'timestamp', nullable: true })
  modDt!: Date | null;
}
