import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/middleware/multer.middleware';
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

  @Post('me')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async setUser(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<Users> {
    const user = await this.getUser(req);
    return this.usersService.setUser(user.id, file);
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

  @Get('me/tfa/:code')
  async checkTwoFactorAuthCode(@Req() req: any, @Param('code') code: string): Promise<Object> {
    const user = await this.getUser(req);
    return this.usersService.checkTwoFactorAuthCode(user.id, code);
  }
}
