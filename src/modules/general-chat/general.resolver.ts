import { Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import { GeneralEntity } from './entities/general.entity';
import { GeneralService } from './general.service';
import { GeneralUpsertInput, ChatSessionInput } from './dto/general.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => GeneralEntity)
export class GeneralResolver {
  constructor(private svc: GeneralService) {}

  @Query(() => [GeneralEntity])
  async list() {
    return this.svc.list();
  }

  @Query(() => GeneralEntity)
  general(@Args('room_id') room_id: string) {
    return this.svc.findOne(room_id);
  }

  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  // @Mutation(() => GeneralEntity)
  // generalChatSession(@Args('stream', { type: () => Boolean, nullable: true }) stream: boolean,
  //                    @Args('room_id') session_id: string, 
  //                    @Args('body') body: ChatSessionInput) {
  //     return this.svc.runChatSession(
  //     stream, 
  //     session_id, 
  //     body 
  //   );  
  // }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => GeneralEntity)
  generalUpsert(@Args('room_id') room_id: string, @Args('body') body: GeneralUpsertInput) {
    return this.svc.upsert(room_id, body);    
  }

  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => Boolean)
  generalDelete(@Args('room_id') room_id: string) {
    return this.svc.remove(room_id);
  }
}
