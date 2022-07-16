import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';

/**
 *  @class UsersService
 */
@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  /**
   * @param usersRepository
   */
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  /**
   * 유저 생성
   * @param createUserDto
   * @returns Promise<void>
   */
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }

  /**
   * 유저 조회
   * @param email
   * @returns
   */
  async getUserByEmail(email: string): Promise<Users> {
    const user = await this.usersRepository.findOne({ email });
    return user;
  }

  /**
   * 닉네임 수정
   * @param nickname
   * @returns
   */
  async getUserByNickname(nickname: string): Promise<Users> {
    const user = await this.usersRepository.findOne({ nickname });
    return user;
  }

  /**
   * two-factor authentication 설정
   * @param nickname
   * @param tfa
   * @returns user object
   */
  async setTwoFactorAuthByNickname(nickname: string, tfa: boolean): Promise<Users> {
    const user = await this.getUserByNickname(nickname);

    this.logger.log(`setTwoFactorAuthByNickname: user.tfa Before = ${user.tfa}`);
    user.tfa = tfa;
    this.logger.log(`setTwoFactorAuthByNickname: user.tfa After = ${user.tfa}`);
    await this.usersRepository.save(user);
    return user;
  }
}
