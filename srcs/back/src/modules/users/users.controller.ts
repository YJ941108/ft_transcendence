import { Body, Controller, Get, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
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
  createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    this.logger.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }

  @Get('/me')
  getUser(@Req() req: any): Promise<Users> {
    const email = req?.user?.email;
    const user = this.usersService.getUser(email);
    return user;
  }

  @Get(':nickname')
  getUserByNickname(@Req() req: any, @Param('nickname') nickname: string): Promise<Users> {
    const user = this.usersService.getUserByNickname(nickname);
    return user;
  }
}
