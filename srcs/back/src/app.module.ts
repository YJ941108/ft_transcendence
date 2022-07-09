import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import defaultConfig from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: 5432,
      username: 'transcendence',
      password: 'transcendence',
      database: 'transcendence',
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env`,
      load: [defaultConfig],
      isGlobal: true,
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    GameModule,
  ],
})
export class AppModule {}
