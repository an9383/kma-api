import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<'graphql'>() === 'graphql') {
      const gql = GqlArgumentsHost.create(host);
      const ctx = gql.getContext();
      const url = ctx?.req?.originalUrl;
      // GraphQL은 응답 포맷을 Apollo가 처리하므로, 여기서는 "무조건" 서버 로그에 상세를 남깁니다.
      if (exception instanceof Error) {
        this.logger.error(
          `[GQL-EX] ${exception.name}: ${exception.message} (${url ?? 'unknown'})`,
          exception.stack,
        );
      } else {
        this.logger.error(`[GQL-EX] Non-Error exception (${url ?? 'unknown'})`, JSON.stringify(exception));
      }
      return;
    }
    const http = host.switchToHttp();
    const res = http.getResponse();
    const req = http.getRequest();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal Server Error';

    // REST 요청은 여기서 표준 포맷으로 내려주되, 서버 로그에 stacktrace까지 반드시 남깁니다.
    if (exception instanceof Error) {
      this.logger.error(
        `[HTTP-EX] ${exception.name}: ${exception.message} (${req?.method ?? ''} ${req?.url ?? ''})`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `[HTTP-EX] Non-Error exception (${req?.method ?? ''} ${req?.url ?? ''})`,
        JSON.stringify(exception),
      );
    }
    res.status(status).json({ success: false, message, path: req?.url, timestamp: new Date().toISOString() });
  }
}
