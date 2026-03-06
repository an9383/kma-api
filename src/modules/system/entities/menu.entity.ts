import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'kma_menu_m' })
export class MenuEntity {
  @Field(() => String)
  @PrimaryColumn({ name: 'menu_id', type: 'varchar', length: 20 })
  menuId!: string;

  @Field(() => String)
  @Column({ name: 'menu_nm', type: 'varchar', length: 100 })
  menuNm!: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'up_id', type: 'varchar', length: 20, nullable: true })
  upId!: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'path', type: 'varchar', length: 200, nullable: true })
  path!: string | null;

  @Field(() => Int)
  @Column({ name: 'sort', type: 'int', default: 0 })
  sort!: number;

  @Field(() => String)
  @Column({ name: 'use_yn', type: 'char', length: 1, default: 'Y' })
  useYn!: string;

  @Field({ nullable: true })
  @CreateDateColumn({ name: 'reg_dt' })
  regDt!: Date;

  @Column({ name: 'reg_id', nullable: true })
  regId!: string;

  @UpdateDateColumn({ name: 'mod_dt', nullable: true })
  modDt!: Date;

  @Column({ name: 'mod_id', nullable: true })
  modId!: string;

  // FE MenuItemType 구조에 맞추기 위한 가상 필드 (Tree 구조용)
  @Field(() => [MenuEntity], { nullable: true })
  children?: MenuEntity[];

  @Field(() => String)
  id!: string; // FE의 id 매핑용

  @Field(() => String)
  label!: string; // FE의 label 매핑용
}
