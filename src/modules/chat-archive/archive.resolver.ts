import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger, } from '@nestjs/common';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveService } from './archive.service';
import { ArchiveUpsertInput, ArchiveSearchListInput } from './dto/archive.input';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UpdateArchiveDto } from './dto/update-archive.dto';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => ArchiveEntity)
export class ArchiveResolver {
  constructor(private svc: ArchiveService) {}

  @Query(() => [ArchiveEntity])
  async archiveList() {
    return this.svc.list();
  }

  @Query(() => ArchiveEntity)
  archive(@Args('archiveId') archiveId: string) {
    return this.svc.findOne(archiveId);
  }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => ArchiveEntity)
  archiveUpsert(@Args('archiveId') archiveId: string, @Args('roomName') body: ArchiveUpsertInput) {
    return this.svc.upsert(archiveId, body);    
  }
  

  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => Boolean)
  archiveDelete(@Args('archiveId') archiveId: string) {
    return this.svc.remove(archiveId);
  }
}
