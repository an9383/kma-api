import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 인가(Authorization) 처리를 담당하는 가드입니다.
 * 인증된 사용자가 특정 기능을 수행할 수 있는 권한이 있는지 최종 확인합니다.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // 1단계: 실행 중인 핸들러(메서드)나 클래스에 선언된 권한 메타데이터(@Roles)를 추출합니다.
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // 설정된 권한 요구사항이 없다면 모든 사용자에게 접근을 허용합니다.
    if (!required?.length) {
      return true;
    }

    // 2단계: GraphQL 컨텍스트에서 요청(Request) 객체를 추출합니다.
    const gql = GqlExecutionContext.create(ctx);
    const req = gql.getContext()?.req;

    // 3단계: 앞선 인증 단계(GqlAuthGuard)에서 주입된 사용자 정보 및 역할을 확인합니다.
    // [보완] 데모용 fallback 로직을 제거하여 보안 홀을 차단했습니다.
    const user = req?.user;
    const roles: string[] = user?.roles ?? [];

    // 4단계: 사용자가 보유한 역할 중 하나라도 요구사항에 부합하는지 체크합니다.
    const hasPermission = required.some((r) => roles.includes(r));

    if (!hasPermission) {
      // 권한 부적격 시 보안 정책에 따라 명시적인 금지 예외를 송출합니다.
      throw new ForbiddenException('해당 리소스에 접근할 권한이 없습니다.');
    }

    return true;
  }
}
