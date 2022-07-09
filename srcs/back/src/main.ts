import { Logger, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketIoAdapter } from './adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const origin = configService.get('front.origin');
  app.enableCors({
    origin: [origin],
    methods: ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  const port = configService.get('port');
  Logger.log(`.env PORT=${port}`);

  await app.listen(port);
}
bootstrap();
