import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UsersRepository) private usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }
}
