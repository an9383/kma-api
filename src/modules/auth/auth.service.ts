import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';

/**
 * 인증 및 권한 관리를 담당하는 핵심 서비스 클래스입니다.
 * 시스템 보안 정책에 따른 사용자 식별 및 JWT 발행을 수행합니다.
 */
@Injectable()
export class AuthService {
  // 보안 감사 및 장애 트래킹을 위한 로거 인스턴스
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService, // 사용자 마스터 정보 조회를 위한 의존성 주입
    private readonly jwtService: JwtService, // 표준 토큰 생성 및 검증 모듈
    private readonly httpService: HttpService
  ) {}

  /**
   * 사용자 로그인을 처리하고 세션 유지를 위한 인증 토큰을 반환합니다.
   * @param id 사용자 고유 계정 ID
   * @param pw 평문 비밀번호 (보안을 위해 트림 처리 후 비교)
   */
  async login(id: string, pw: string) {
    // 입력값 검증: 필수 파라미터 누락 시 즉시 예외 처리 (Fail-Fast 원칙)
    if (!id || !pw) throw new UnauthorizedException('ID와 PW를 입력하세요.');

    // 1단계: 데이터베이스 마스터 테이블(kma_usr_m)에서 사용자 식별 정보 조회
    const user = await this.userService.findOne(id);

    // 데이터 정합성 보장을 위해 DB 저장값과 입력값의 공백 제거 후 비교 수행
    // 향후 단방향 해시 암호화 적용 시 해당 구간 로직 고도화 필요
    const dbPswd = (user as any)?.pswd?.toString().trim();
    const inputPw = pw?.toString().trim();

    // 사용자가 존재하지 않거나 비밀번호가 일치하지 않을 경우 통합 에러 반환 (보안성 강화)
    if (!user || dbPswd !== inputPw) {
      // 보안 감사를 위해 실패 사유를 서버 로그에 기록
      this.logger.error(`인증 실패 - ID: ${id} | 입력PW: ${inputPw} | DB PW: ${dbPswd}`);
      throw new UnauthorizedException('ID 또는 비밀번호가 일치하지 않습니다.');
    }
    
    // 2단계: 인증 성공 사용자를 위한 세션 정보(JWT Payload) 구성
    // sub: 토큰 식별자(ID), username: 사용자 명칭
    //const payload = { sub: user.id, username: user.name, useremail: user.email };
    const payload = { sub: user.id, useremail: user.email };
    console.log(payload);

    // 발행된 토큰과 프론트엔드 전역 상태 관리를 위한 최소한의 프로필 정보를 반환합니다.
    return {
      accessToken: this.jwtService.sign(payload), // 설정된 알고리즘으로 디지털 서명된 토큰 생성
      user: {
        userId: user.id,
        //userName: user.name,
        userEmail: user.email,
        // 권한 설계: admin 계정 여부에 따른 동적 역할 할당
        //roles: user.id === 'admin' ? ['ADMIN'] : ['USER'],
        roles: user.role == '1' ? ['ADMIN'] : ['USER'],
      },
    };
  }

  async requestAthenaToken(userEmail: string) {
    try {
      // 1. Private Key 불러오기
      const privateKeyPem = fs.readFileSync('private_key.pem', 'utf8');
      console.log(privateKeyPem);

      // 2. JWT (Assertion) 생성 (상대방이 요구한 규격)
      const payload = {
        email: userEmail,
      };

      const signOptions: jwt.SignOptions = {
        algorithm: 'RS256',
        issuer: 'kma-portal',
        audience: 'kma-iam',
        expiresIn: '5m',
        header: {
          jwks_url: 'https://[kma-portal-domain url]/api/v1/auth/jwks.json',  //jwks_url주소입력
          kid: 'ai-portal-key-1'
        } as any 
      };

      const assertion = jwt.sign(payload, privateKeyPem, signOptions);
      console.log(assertion);

      // 3. Athena API 호출 (exchange-token)
      const athenaApiUrl = 'http://IAM_SERVER_URL/api/v1/auth/sso/exchange-token';  //jwks_url주소입력
      const returnToUrl = 'https://athena.kubagents-dev.koreacb.com/Dashboard';

      const response = await firstValueFrom(
        this.httpService.post(athenaApiUrl, {
          assertion: assertion,
          return_to: returnToUrl,
        })
      );
      console.log(response);

      // 4. 발급받은 데이터(Athena 세션/토큰 정보) 반환
      return response.data;

    } catch (error) {
      console.error('Athena 토큰 발급 실패:', error);
      throw new InternalServerErrorException('SSO 인증 연동 중 오류가 발생했습니다.');
    }
  }
}
