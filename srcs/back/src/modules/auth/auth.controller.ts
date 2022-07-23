import { ConflictException, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { join } from 'path';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';

/**
 *
 */
@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  /**
   *
   * @param userRepository
   * @param jwtService
   * @param configService
   */
  constructor(
    private userRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   *
   * @param request
   * @param response
   */
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

  @Post('email')
  async emailCallback(
    @Req()
    request,
    @Res()
    response: Response,
  ): Promise<void> {
    this.logger.log(JSON.stringify(request.body));
    const { email } = request.body;
    const photo = email;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      const serverOrigin = this.configService.get<string>('server.origin');
      this.logger.log(`setUser: serverOrigin: ${serverOrigin}`);
      const fileLocation = serverOrigin + join('/api/profile', 'pong.png');
      this.logger.log(`setUser: fileLocation: ${fileLocation}`);
      const createUserDto: CreateUserDto = { username: email, email, photo: fileLocation, nickname: email };
      await this.userRepository.createUser(createUserDto);
    }
    const payload = { email };
    const accessToken = this.jwtService.sign(payload);
    const origin = this.configService.get<string>('client.origin');
    response.redirect(302, origin + `/auth?access_token=${accessToken}`);
  }

  /**
   *
   * @param email
   * @returns
   */
  @Get('login/:email')
  async login(@Param('email') email: string, @Res() response: Response): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ email });
      this.logger.log(user);
      const payload = { email: user.email };
      const accessToken = this.jwtService.sign(payload);
      const origin = this.configService.get<string>('client.origin');
      this.logger.log(accessToken);
      response.redirect(302, origin + `/auth?access_token=${accessToken}`);
    } catch (e) {
      throw new ConflictException(e);
    }
  }

  /**
   *
   * @param email
   * @returns
   */
  @Get('token/:email')
  async token(@Param('email') email: string): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ email });
      const payload = { email: user.email };
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    } catch (e) {
      throw new ConflictException(e);
    }
  }
}
