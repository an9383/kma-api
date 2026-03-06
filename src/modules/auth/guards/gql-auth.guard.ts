import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

/**
 * 인증을 선택적으로 적용하기 위한 Public 데코레이터
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * GraphQL 컨텍스트에서 Request 객체를 추출합니다.
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  /**
   * 인증 결과 처리 로직
   * @Public() 데코레이터 유무에 따라 예외 발생 여부를 결정합니다.
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 1. 현재 호출된 핸들러(메서드)나 클래스에 @Public() 데코레이터가 있는지 확인합니다.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. 인증 실패 시 (에러가 있거나 유저 정보가 없는 경우)
    if (err || !user) {
      // @Public()이 설정된 경우(예: 로그인 체크용 프로필 쿼리),
      // 예외를 던지지 않고 null을 반환하여 프론트엔드에 에러가 노출되지 않게 합니다.
      if (isPublic) {
        return null;
      }

      // @Public()이 없는 일반적인 보호 경로에서는 기존처럼 명시적 예외를 던집니다.
      // 이는 RolesGuard 등 후속 가드에서 유저 정보 유실로 인한 혼선을 방지합니다.
      throw err || new UnauthorizedException('보안 인증에 실패하였습니다.');
    }

    return user;
  }
}
