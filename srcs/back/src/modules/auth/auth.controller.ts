import { Controller, Get, Logger, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('42'))
  @Get('42/callback')
  @Redirect('http://localhost:3031')
  async fortyTwoCallback(
    @Req()
    req,
  ) {
    Logger.log(req.user);

    return req.user;
  }
}
