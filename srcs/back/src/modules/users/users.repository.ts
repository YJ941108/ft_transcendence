import { EntityRepository, Repository } from 'typeorm';
import { Users } from './users.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  async createUser(): Promise<Users> {
    const user = this.create({
      name: 'test',
    });
    await this.save(user);
    return user;
  }
}
