import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// TypeORM 기본 로거 대신, QueryRunner wrapper(DbQueryLogPatch)에서 로그를 한 번만 남깁니다.

export function TypeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  const env = (config.get<string>('APP_ENV') ?? 'dev').toLowerCase();
  const isDev = ['dev', 'local'].includes(env);
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: Number(config.get('DB_PORT')),
    username: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASS'),
    database: config.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
    logger: undefined,
    maxQueryExecutionTime: undefined,
  };
}
