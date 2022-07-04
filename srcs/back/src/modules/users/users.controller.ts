import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController');
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    this.logger.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }
}
