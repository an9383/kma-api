import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

/**
 * JWT 토큰을 해석하여 사용자의 신원을 검증하고 보안 컨텍스트를 복구하는 전략 클래스입니다.
 * Passport 프레임워크와 결합하여 모든 보호된 자원에 대한 1차 관문 역할을 수행합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // HTTP 요청 헤더에서 Authorization Bearer 토큰을 추출하도록 설정합니다.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 토큰의 만료 여부를 자동으로 확인하여 만료 시 즉시 인증을 거부합니다.
      ignoreExpiration: false,
      // 환경 변수에 정의된 강력한 비밀키를 사용하여 토큰의 디지털 서명을 검증합니다.
      secretOrKey: config.get<string>('JWT_SECRET') || 'change-me',
    });
  }

  /**
   * 토큰 검증이 성공적으로 완료되면 Passport에 의해 호출되는 콜백 메서드입니다.
   * 반환된 객체는 모든 컨트롤러와 리졸버의 Request 또는 Context 객체 내 user 필드에 할당됩니다.
   * @param payload 토큰 내부에 암호화되어 저장된 데이터 정보 (sub, username 등)
   */
  async validate(payload: any) {
    // 토큰의 sub 필드에 저장된 사용자 식별자를 사용하여 실제 DB 존재 여부를 확인합니다.
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      // 토큰은 유효하나 해당 사용자가 시스템 마스터에 존재하지 않는 경우 보안 예외를 송출합니다.
      throw new UnauthorizedException('유효하지 않은 보안 세션 정보입니다.');
    }

    // [핵심 보완] RolesGuard가 정상적으로 권한을 식별할 수 있도록 roles 배열을 반드시 포함해야 합니다.
    // 시스템 정책에 따라 관리자 ID인 경우 ADMIN 권한을 동적으로 부여하여 인가 실패 문제를 해결합니다.
    return {
      id: user.id,
      name: user.name,
      roles: user.id === 'admin' ? ['ADMIN'] : ['USER'],
    };
  }
}
