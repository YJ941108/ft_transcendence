import { Module } from '@nestjs/common';
import { AuthFortyTwoController } from './auth-fortytwo.controller';
import { AuthFortyTwoStrategy } from './auth-fortytwo.strategy';

@Module({
  controllers: [AuthFortyTwoController],
  providers: [AuthFortyTwoStrategy],
})
export class AuthFortyTwoModule {}
