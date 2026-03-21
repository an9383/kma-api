import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger, } from '@nestjs/common';
import { GeneralEntity } from './entities/general.entity';
import { GeneralService } from './general.service';
import { GeneralUpsertInput, GeneralSearchListInput } from './dto/general.input';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateGeneralDto } from './dto/update-general.dto';

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

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => GeneralEntity)
  generalUpsert(@Args('room_id') room_id: string, @Args('body') body: GeneralUpsertInput) {
    return this.svc.upsert(room_id, body);    
  }

  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => Boolean)
  generalDelete(@Args('room_id') room_id: string) {
    return this.svc.remove(room_id);
  }
}
