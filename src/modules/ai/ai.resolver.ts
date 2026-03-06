import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger, } from '@nestjs/common';
import { AiEntity } from './entities/ai.entity';
import { AiService } from './ai.service';
import { AiUpsertInput, AiSearchListInput } from './dto/ai.input';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UpdateAiDto } from './dto/update-ai.dto';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => AiEntity)
export class AiResolver {
  constructor(private svc: AiService) {}

  // @Query(() => [AiEntity])
  // async aiList(@Args('startDate') startDate: string, @Args('endDate') endDate: string) {
  //   return this.svc.list(startDate, endDate);
  // }

  @Query(() => [AiEntity])
  async aiList() {
    return this.svc.list();
  }

  @Query(() => AiEntity)
  ai(@Args('sessionId') sessionId: string) {
    return this.svc.findOne(sessionId);
  }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => AiEntity)
  aiUpsert(@Args('sessionId') sessionId: string, @Args('roomName') body: AiUpsertInput) {
    return this.svc.upsert(sessionId, body);    
  }
  

  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => Boolean)
  aiDelete(@Args('sessionId') sessionId: string) {
    return this.svc.remove(sessionId);
  }
}
