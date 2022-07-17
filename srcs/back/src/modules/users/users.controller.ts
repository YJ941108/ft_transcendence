import { Body, Controller, Get, Logger, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  private logger = new Logger('UsersController');
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    this.logger.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }

  @Get('me')
  async getUser(@Req() req: any): Promise<Users> {
    const email = req?.user?.email;
    const user = await this.usersService.getUserByEmail(email);
    return user;
  }

  @Get(':nickname')
  async getUserByNickname(@Param('nickname') nickname: string): Promise<Users> {
    const user = await this.usersService.getUserByNickname(nickname);
    return user;
  }

  @Patch('me/tfa')
  async setTwoFactorAuthValid(@Req() req: any): Promise<Users> {
    const user = await this.getUser(req);
    return this.usersService.setTwoFactorAuthValid(user.id, req.body.tfa);
  }

  @Get('me/tfa')
  async getTwoFactorAuthCode(@Req() req: any): Promise<Object> {
    const user = await this.getUser(req);
    return this.usersService.getTwoFactorAuthCode(user.id);
  }
}
