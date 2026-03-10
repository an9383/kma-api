import { Controller, Get, Post, OnModuleInit, Param, Body, Logger, HttpStatus, HttpCode} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import * as fs from 'fs';
// @ts-ignore
import rsaPemToJwk from 'rsa-pem-to-jwk';
import { AuthResolver } from './auth.resolver';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthEntity} from './entities/auth.entity';

@Controller('api/auth')
export class AuthController implements OnModuleInit {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authResolver: AuthResolver) {}
  // 변환된 JWKS 데이터를 메모리에 저장할 변수
  private cachedJwks: any;

  onModuleInit() {
    const publicKeyPem = fs.readFileSync('public_key.pem', 'utf8');
    const jwk = rsaPemToJwk(publicKeyPem, { kid: 'ai-portal-key-1', use: 'sig' });
    this.cachedJwks = {
      keys: [
        {
          ...jwk,
          alg: 'RS256',
        }
      ]
    };
    console.log('JWKS successfully loaded and cached.');
  }
  
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body('id') id: string, @Body('pw') pw: string) {
      this.logger.log({ id, pw});
      return this.authResolver.login(id, pw);
  }

  @Post('/athena-token')
  @HttpCode(HttpStatus.OK)
  async requestAthenaToken(@Body('id') id: string, @Body('pw') pw: string) {
    this.logger.log({ id, pw });

    const loginResult = await this.authResolver.login(id, pw);
    const email = loginResult.user.userEmail;
    this.logger.log(email);

    return this.authResolver.requestAthenaToken(email);
  }

  @Get('.well-known/jwks.json')
  getJwks() {
    // API 호출 시에는 파일 입출력 없이 메모리에 있는 객체만 즉시 반환
    return this.cachedJwks;
  }

}