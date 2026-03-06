import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MemberEntity } from './entities/member.entity';
import { MemberService } from './member.service';
import { MemberUpsertInput, MemberSearchInput } from './dto/member.input';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => MemberEntity)
export class MemberResolver {
  constructor(private svc: MemberService) {}

  @Query(() => [MemberEntity])
  async memberList(@Args('input', { nullable: true }) input: MemberSearchInput) {
    return this.svc.list(input);
  }

  @Query(() => MemberEntity, { nullable: true })
  member(@Args('userId') userId: string) {
    return this.svc.findOne(userId);
  }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => MemberEntity)
  memberUpsert(@Args('input') input: MemberUpsertInput) {
    return this.svc.upsert(input);
  }

  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => Boolean)
  memberDelete(@Args('userId') userId: string) {
    return this.svc.remove(userId);
  }
}
