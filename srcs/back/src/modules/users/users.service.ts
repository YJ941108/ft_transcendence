import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';
import { randomString } from 'src/utils/randomString';
import { MailerService } from '@nestjs-modules/mailer';

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
    @InjectRepository(UsersRepository) private usersRepository: UsersRepository,
    private readonly mailerService: MailerService,
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
   * @param id
   * @returns
   */
  async getUser(id: number): Promise<Users> {
    const user = await this.usersRepository.findOne({ id });
    return user;
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
   * 유저 조회
   * @param nickname
   * @returns
   */
  async getUserByNickname(nickname: string): Promise<Users> {
    const user = await this.usersRepository.findOne({ nickname });
    return user;
  }

  /**
   * two-factor authentication 설정
   * @param id
   * @param tfa
   * @returns user object
   */
  async setTwoFactorAuthValid(id: number, tfa: boolean): Promise<Users> {
    const user = await this.getUser(id);
    this.logger.log(`setTwoFactorAuthValid: user = ${user}`);

    this.logger.log(`setTwoFactorAuthValid: user.tfa Before = ${user.tfa}`);
    user.tfa = tfa;
    this.logger.log(`setTwoFactorAuthValid: user.tfa After = ${user.tfa}`);
    await this.usersRepository.save(user);
    return user;
  }

  /**
   * two-factor authentication 설정
   * @param id
   * @returns randomNumber
   */
  async getTwoFactorAuthCode(id: number): Promise<Object> {
    const user = await this.getUser(id);
    this.logger.log(`setTwoFactorAuthValid: user = ${JSON.stringify(user)}`);

    const randomNumber: string = randomString(4, '#');
    this.logger.log(`getTwoFactorAuthCode: randomNumber: ${randomNumber}`);
    user.tfa_secret = randomNumber;
    this.logger.log(`getTwoFactorAuthCode: user: ${user.email}`);

    this.mailerService
      .sendMail({
        to: user.email, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'ft_transcendence 2FA 코드입니다. ✔', // Subject line
        text: 'welcome', // plaintext body
        html: `<b>${randomNumber}</b>`, // HTML body content
      })
      .then((e) => {
        this.logger.log(`mailerService: sendMail successed: ${JSON.stringify(e)}`);
      })
      .catch((e) => {
        this.logger.log(`mailerService: sendMail error: ${JSON.stringify(e)}`);
        throw new InternalServerErrorException(`Internal Server Error in getTwoFactorAuthCode`);
      });

    await this.usersRepository.save(user);

    return {
      statusCode: 200,
      message: 'Successed',
    };
  }
}
