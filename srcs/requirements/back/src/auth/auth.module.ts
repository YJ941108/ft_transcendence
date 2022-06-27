import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './strategies/forty-two.strategy';

@Module({
  controllers: [AuthController],
  providers: [FortyTwoStrategy],
})
export class AuthModule {}
