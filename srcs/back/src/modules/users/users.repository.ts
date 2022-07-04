import { ConflictException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { username, email, photo } = createUserDto;
    const user = this.create({
      username,
      email,
      photo,
    });

    try {
      await this.save(user);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Already registered' });
      } else {
        throw new InternalServerErrorException(e);
      }
    }
  }
}
