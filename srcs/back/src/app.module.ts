import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import defaultConfig from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

const id = 'owen.ki.dev@gmail.com';
const pw = 'b8b8x3x3Q%';
const email = 'smtp.gmail.com';

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
    MailerModule.forRoot({
      transport: {
        host: email,
        secure: false,
        auth: {
          user: id,
          pass: pw,
        },
      },
      // defaults: {
      //   from: '"nest-modules" <owen.ki.dev@gmail.com>',
      // },
      // template: {
      //   dir: __dirname + '/templates',
      //   adapter: new PugAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    GamesModule,
  ],
})
export class AppModule {}
