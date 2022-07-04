import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: 'Secret1234',
      signOptions: {
        expiresIn: 3600,
      },
    }),
    UsersModule,
    TypeOrmModule.forFeature([UsersRepository]),
  ],
  controllers: [AuthController],
  providers: [FortyTwoStrategy, AuthService],
})
export class AuthModule {}
