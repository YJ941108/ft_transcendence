import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuthFortyTwoModule } from './modules/auth-fortytwo/auth-fortytwo.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'transcendence',
      password: 'transcendence',
      database: 'transcendence',
      entities: [__dirname + '../**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    AuthFortyTwoModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
