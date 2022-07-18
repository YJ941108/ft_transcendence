import { Logger, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketIoAdapter } from './adapters/socket-io.adapter';
import { join } from 'path';

async function bootstrap() {
  /** 로그 */
  const logger: Logger = new Logger('Main');

  /** Express기반 앱 생성 */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /** 환경변수 */
  const configService = app.get(ConfigService);

  /** CORS */
  const origin = configService.get('front.origin');
  app.enableCors({
    origin: [origin],
    methods: ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  /** Cookie 미들웨어 추가 */
  app.use(cookieParser());

  /** API 요청시 /api로 시작 */
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  /** socket.io 미들웨어 추가 */
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  /** 서버에 저장된 프로필 이미지 요청 가능 */
  const path = join(__dirname, '..', 'uploads');
  logger.log(`path: ${path}`);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    index: false,
    prefix: '/uploads',
  });

  /** 소켓 수신 */
  const port = configService.get('port');
  logger.log(`.env PORT=${port}`);
  await app.listen(port);
}
bootstrap();
