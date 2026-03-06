import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserUpsertInput } from './dto/user.input';

//인증과 권한의 결합
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GqlAuthGuard, Public } from '../auth/guards/gql-auth.guard';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * 현재 로그인한 사용자 프로필 조회
   * 'GqlAuthGuard'만 사용하여 토큰이 있으면 유저를 복구하고, 없어도 에러 없이 null을 반환합니다.
   * RolesGuard를 여기서 제외해야 로그인 페이지 진입 시 403 Forbidden 에러가 나지 않습니다.
   */
  @UseGuards(GqlAuthGuard)
  @Public() // 이 데코레이터를 추가하면 로그인이 안 된 상태에서도 에러 메시지가 뜨지 않습니다.
  @Query(() => UserEntity, { name: 'myProfile', nullable: true })
  async getMyProfile(@Context() context: any) {
    // Passport 세션에서 복구된 유저 객체 추출
    const user = context.req.user;
    const userId = user?.id || user?.userId;

    // 디버깅 로그: 개발 단계에서 인증 정합성 확인용
    console.log('[UserResolver] Profile requested. User session:', user);

    if (!userId) {
      // 인증되지 않은 사용자(게스트)인 경우 null 반환 (FE의 세션 체크 로직과 연계)
      return null;
    }

    // DB(kma_usr_m)에서 최신 마스터 정보 조회
    return this.userService.findOne(userId);
  }

  /**
   * 사용자 목록 조회
   * 관리 시스템 성격에 따라 @UseGuards(GqlAuthGuard) 추가 고려 가능
   */
  @Query(() => [UserEntity], { name: 'userList' })
  async getUsers(
    @Args('keyword', { nullable: true }) keyword?: string,
    @Args('dept', { nullable: true }) dept?: string,
  ) {
    return this.userService.findAll(keyword, dept);
  }

  /**
   * 특정 사용자 상세 조회
   */
  @Query(() => UserEntity, { name: 'user', nullable: true })
  async getUser(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * 사용자 정보 저장 및 수정
   * 반드시 관리자(ADMIN) 권한이 있는 인증된 사용자만 허용합니다.
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => UserEntity)
  async userUpsert(@Args('input') input: UserUpsertInput) {
    return this.userService.upsert(input);
  }

  /**
   * 사용자 정보 삭제
   * 관리자 전용 기능 (인증 + 권한 체크)
   */
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Mutation(() => Boolean)
  async userDelete(@Args('id') id: string) {
    return this.userService.remove(id);
  }
}
