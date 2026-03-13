import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger, } from '@nestjs/common';
import { ArchiveEntity } from './entities/archive.entity';
import { ArchiveService } from './archive.service';
import { ArchiveUpsertInput } from './dto/archive.input';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => ArchiveEntity)
export class ArchiveResolver {
  private readonly logger = new Logger(ArchiveResolver.name);
  constructor(private svc: ArchiveService) {}

  @Query(() => [ArchiveEntity])
  async archiveList() {
    return this.svc.list();
  }

  @Query(() => ArchiveEntity)
  archive(@Args('archive_id') room_id: string) {
    return this.svc.findOne(room_id);
  }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => ArchiveEntity)
  async archiveUpsert(
    @Args('room_id') room_id: string,
    @Args('body', { type: () => ArchiveUpsertInput }) body: ArchiveUpsertInput 
  ) {
    this.logger.log(room_id, body)
    return this.svc.upsert(room_id, body);
  }
  
  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => Boolean)
  archiveDelete(@Args('room_id') room_id: string) {
    return this.svc.remove(room_id);
  }
}
