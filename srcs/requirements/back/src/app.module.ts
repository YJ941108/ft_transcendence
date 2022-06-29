import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthFortyTwoModule } from './modules/auth-fortytwo/auth-fortytwo.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    AuthFortyTwoModule,
    HealthModule,
  ],
})
export class AppModule {}
