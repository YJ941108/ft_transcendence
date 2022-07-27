import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import defaultConfig from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env`,
      load: [defaultConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: 5432,
      username: 'ft_transcendence',
      password: 'ft_transcendence',
      database: 'ft_transcendence',
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: 'smtps://taws0206@gmail.com:rjtnyxlcxdostjzj@smtp.gmail.com',
      defaults: {
        from: '"nest-modules" <noreply@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    GamesModule,
    ProfileModule,
    ChatModule,
  ],
})
export class AppModule {}
