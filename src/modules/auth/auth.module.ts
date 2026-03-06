import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule, // 사용자 정보 대조를 위한 도메인 모듈 주입
    PassportModule.register({ defaultStrategy: 'jwt' }), // 표준 인증 프레임워크인 Passport 연동
    JwtModule.registerAsync({
      // 비동기 구성을 통한 환경 변수 동적 주입
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // 보안 강화를 위해 환경 설정에서 시크릿 키 로드
        secret: config.get<string>('JWT_SECRET') || 'change-me',
        // 토큰 탈취 리스크를 고려한 2시간 유효 기간 설정
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  // 인증 로직 및 전략 클래스 등록
  providers: [AuthService, AuthResolver, JwtStrategy],
  // 타 모듈에서 인증 기능을 재사용할 수 있도록 서비스 내보내기
  exports: [AuthService],
})
export class AuthModule {}
