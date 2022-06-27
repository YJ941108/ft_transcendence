import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '../config/configuration';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    load: [configuration]
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
