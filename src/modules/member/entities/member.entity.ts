import { Field, Int, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// GraphQL 조회와 데이터베이스 테이블 설정을 동시에 수행하는 회원 엔티티 클래스입니다
@ObjectType()
@Entity({ name: 'kma_mbr_m' })
export class MemberEntity {
  // 사용자의 고유 아이디이며 중복될 수 없는 기본키입니다
  @Field(() => String)
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 20 })
  userId!: string;

  // 사용자의 이름을 저장하는 칸입니다
  @Field(() => String)
  @Column({ name: 'user_name', type: 'varchar', length: 50 })
  userName!: string;

  // 사용자의 나이를 숫자로 저장하며 값이 비어있을 수 있습니다
  @Field(() => Int, { nullable: true })
  @Column({ name: 'age', type: 'int', nullable: true })
  age!: number | null;

  // 가입한 날짜와 시간을 저장하며 GraphQL 날짜 형식으로 변환되어 출력됩니다
  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ name: 'join_date', type: 'timestamp', nullable: true })
  joinDate!: Date | null;

  // 자기소개와 같은 긴 글 내용을 담는 칸입니다
  @Field(() => String, { nullable: true })
  @Column({ name: 'content', type: 'text', nullable: true })
  content!: string | null;

  // 첨부파일들을 묶어서 관리하기 위한 그룹 아이디입니다
  @Field(() => String, { nullable: true })
  @Column({ name: 'file_grp_id', type: 'varchar', length: 50, nullable: true })
  fileGrpId!: string | null;

  // 사용자가 속한 지역본부 코드를 저장하는 칸입니다 (com00006 하위 코드)
  @Field(() => String, { nullable: true })
  @Column({ name: 'area_div', type: 'varchar', length: 50, nullable: true })
  areaDiv!: string | null;

  // 사용자가 선택한 결제수단 코드를 저장하는 칸입니다 (com00007 하위 코드)
  @Field(() => String, { nullable: true })
  @Column({ name: 'pay_div', type: 'varchar', length: 50, nullable: true })
  payDiv!: string | null;

  // 게시판의 분류 코드를 저장하는 칸입니다 (com00009 하위 코드)
  @Field(() => String, { nullable: true })
  @Column({ name: 'board_div', type: 'varchar', length: 50, nullable: true })
  boardDiv!: string | null;

  // 데이터가 처음 만들어진 날짜와 시간으로 서버에서 자동으로 입력해줍니다
  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn({ name: 'reg_dt', type: 'timestamp', nullable: true })
  regDt!: Date | null;

  // 데이터를 처음 등록한 사람의 아이디를 저장합니다
  @Field(() => String, { nullable: true })
  @Column({ name: 'reg_id', type: 'varchar', length: 50, nullable: true })
  regId!: string | null;

  // 데이터가 마지막으로 수정된 날짜와 시간이며 수정될 때마다 자동으로 바뀝니다
  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn({ name: 'mod_dt', type: 'timestamp', nullable: true })
  modDt!: Date | null;

  // 마지막으로 데이터를 수정한 사람의 아이디를 저장합니다
  @Field(() => String, { nullable: true })
  @Column({ name: 'mod_id', type: 'varchar', length: 50, nullable: true })
  modId!: string | null;
}
