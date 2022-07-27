import {
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { multerOptions } from 'src/middleware/multer.middleware';
import { Users } from './entity/users.entity';
import { UsersService } from './users.service';

/**
 *
 */
@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  private logger = new Logger('UsersController');

  constructor(private usersService: UsersService) {}

  /**
   * 유저 정보 반환
   * @param req
   * @returns
   */
  @Get()
  async getUsers(): Promise<Users[]> {
    const users = await this.usersService.getUsers();
    return users;
  }

  /**
   * 유저 정보 반환
   * @param req
   * @returns
   */
  @Get('me')
  async getUser(@Req() req: any): Promise<Users> {
    const email = req?.user?.email;
    const user = await this.usersService.getUserByEmail(email);
    return user;
  }

  /**
   * 유저 정보 수정
   * @param req
   * @param file
   * @returns
   */
  @Post('me')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async setUser(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<Object> {
    const nickname = req.body.nickname;

    const user = await this.getUser(req);
    return this.usersService.setUser(user.id, file, nickname);
  }

  /**
   * 다른 유저 정보 반환
   * @param nickname
   * @returns
   */
  @Get(':nickname')
  async getUserByNickname(@Param('nickname') nickname: string): Promise<Users> {
    const user = await this.usersService.getUserByNickname(nickname);
    return user;
  }

  /**
   * 유저 정보 반환
   * @param req
   * @returns
   */
  @Get('online')
  async getOnlineUsers(): Promise<Users[]> {
    const users = await this.usersService.getOnlineUsers();
    this.logger.log('online');
    return users;
  }

  /**
   * 다른 유저 정보 반환
   * @param nickname
   * @returns
   */
  @Get(':nickname/:action')
  async userAction(
    @Req() req: any,
    @Param('nickname') nickname: string,
    @Param('action') action: string,
  ): Promise<Users> {
    const id: number = req.user.id;

    return this.usersService.userAction({ id, nickname, action });
  }

  /**
   * two factor authentication 설정
   * @param req
   * @returns
   */
  @Patch('me/tfa')
  async setTwoFactorAuthValid(@Req() req: any): Promise<Users> {
    const user = await this.getUser(req);
    return this.usersService.setTwoFactorAuthValid(user.id, req.body.tfa);
  }

  /**
   * two factor authentication 코드 메일 전송
   * @param req
   * @returns
   */
  @Get('me/tfa')
  async getTwoFactorAuthCode(@Req() req: any): Promise<Object> {
    const user = await this.getUser(req);
    return this.usersService.getTwoFactorAuthCode(user.id);
  }

  /**
   * two factor authentication 코드 확인
   * @param req
   * @param code
   * @returns
   */
  @Get('me/tfa/:code')
  async checkTwoFactorAuthCode(@Req() req: any, @Param('code') code: string): Promise<Object> {
    const user = await this.getUser(req);
    return this.usersService.checkTwoFactorAuthCode(user.id, code);
  }
}
