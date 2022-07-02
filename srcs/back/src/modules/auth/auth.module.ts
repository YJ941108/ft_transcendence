import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [FortyTwoStrategy, AuthService],
})
export class AuthModule {}
