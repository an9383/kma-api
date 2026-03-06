import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CommonCodeEntity } from './entities/common-code.entity';
import { CommonCodeService } from './common-code.service';
import { CommonCodeUpsertInput } from './dto/common-code.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => CommonCodeEntity)
export class CommonCodeResolver {
  constructor(private svc: CommonCodeService) {}

  @Query(() => [CommonCodeEntity])
  comnMasterList() {
    return this.svc.masterList();
  }

  @Query(() => [CommonCodeEntity])
  comnDetailList(@Args('upCd') upCd: string) {
    return this.svc.detailList(upCd);
  }

  @Query(() => [CommonCodeEntity], { name: 'commonCodesByUpCd' })
  async getCodesByUpCd(@Args('upCd') upCd: string) {
    return this.svc.detailList(upCd);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => CommonCodeEntity)
  comnUpsert(@Args('input') input: CommonCodeUpsertInput, @Context() context: any) {
    const user = context.req.user;
    const loginId = user?.userId || user?.id || 'SYSTEM';
    return this.svc.upsert(input, loginId);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => Boolean)
  comnDelete(@Args('comnCd') comnCd: string) {
    return this.svc.remove(comnCd);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => Boolean)
  comnBatchDelete(@Args({ name: 'ids', type: () => [String] }) ids: string[]) {
    return this.svc.batchRemove(ids);
  }
}
