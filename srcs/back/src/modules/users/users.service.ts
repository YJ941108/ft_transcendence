import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UsersRepository) private usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }

  async getUser(email: string): Promise<Users> {
    const user = this.usersRepository.findOne({ email });
    return user;
  }

  async getUserByNickname(nickname: string): Promise<Users> {
    const user = this.usersRepository.findOne({ nickname });
    return user;
  }
}
