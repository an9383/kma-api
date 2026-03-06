import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

// 모듈 및 설정 임포트
import { AttachModule } from './modules/attach/attach.module';
import { TypeOrmConfig } from './common/configs/typeorm.config';
import { MongoModule } from './common/configs/mongo.config';
import { RedisModule } from './common/configs/redis.config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { MemberModule } from './modules/member/member.module';
import { CommonCodeModule } from './modules/common-code/common-code.module';
import { HwpModule } from './modules/hwp/hwp.module';
import { DbQueryLogPatch } from './common/logging/db-query-log-patch';
import { SystemModule } from './modules/system/system.module';
import { UserModule } from './modules/user/user.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    AttachModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.APP_ENV ?? 'dev'}`, '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => TypeOrmConfig(c),
    }),

    MongoModule,
    RedisModule,

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: c.get('NODE_ENV') !== 'production',
        context: ({ req }: { req: any }) => ({ req }),
        csrfPrevention: false,
      }),
    }),
    AiModule,
    HealthModule,
    AuthModule,
    MemberModule,
    CommonCodeModule,
    HwpModule,
    SystemModule,
    UserModule,
  ],
  providers: [DbQueryLogPatch],
})
export class AppModule {}
