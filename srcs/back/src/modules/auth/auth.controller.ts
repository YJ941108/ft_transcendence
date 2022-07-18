import { ConflictException, Controller, Get, Logger, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(
    private userRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get('login/:username')
  async login(@Param('username') username: string): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ username });
      this.logger.log(user);
      const payload = { email: user.email };
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    } catch (e) {
      throw new ConflictException(e);
    }
  }

  @UseGuards(AuthGuard('42'))
  @Get('42/callback')
  async fortyTwoCallback(
    @Req()
    request,
    @Res()
    response: Response,
  ): Promise<void> {
    this.logger.log(request.user);
    const { username, email, photo } = request.user;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      const createUserDto: CreateUserDto = { username, email, photo, nickname: username };
      await this.userRepository.createUser(createUserDto);
    }
    this.logger.log(JSON.stringify(user));
    const payload = { email };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(accessToken);
    const origin = this.configService.get<string>('client.origin');
    this.logger.log('Client Origin' + origin);
    // response.cookie('access_token', accessToken);
    response.redirect(302, origin + `/auth?access_token=${accessToken}`);
  }
}
