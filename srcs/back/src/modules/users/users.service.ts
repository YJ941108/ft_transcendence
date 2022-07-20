import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';
import { randomString } from 'src/utils/randomString';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

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
    private readonly configService: ConfigService,
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
   *
   * @param id
   * @param file
   * @returns
   */
  async setUser(id: number, file: Express.Multer.File, nickname: string | undefined): Promise<Object> {
    const user = await this.getUser(id);
    this.logger.log(`setUser: req: file: ${JSON.stringify(file)}`);
    this.logger.log(`setUser: req: nickname: ${nickname}`);

    if (!file && !nickname) {
      throw new BadRequestException('변경된 내용이 없습니다');
    }

    this.logger.log(`setUser: user: before: ${JSON.stringify(user)}`);

    if (file) {
      this.logger.log(`setUser: file: ${JSON.stringify(file)}`);
      const serverOrigin = this.configService.get<string>('server.origin');
      this.logger.log(`setUser: serverOrigin: ${serverOrigin}`);
      const fileLocation = serverOrigin + join('/api/users/profile', file.filename);
      this.logger.log(`setUser: fileLocation: ${fileLocation}`);
      user.photo = fileLocation;
    }

    if (nickname) {
      const isUser = await this.usersRepository.findOne({ nickname });
      const regex = /^[0-9a-zA-Z]+$/;

      if (isUser) {
        throw new ConflictException('중복된 닉네임입니다');
      } else if (!nickname.match(regex)) {
        throw new ConflictException('올바르지 않은 닉네임입니다');
      }
      user.nickname = nickname;
    }

    this.logger.log(`setUser: user: after: ${JSON.stringify(user)}`);
    await this.usersRepository.save(user);
    return {
      statusCode: 200,
      message: '성공',
      data: user,
    };
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
    user.tfa_code = randomNumber;
    this.logger.log(`getTwoFactorAuthCode: user: ${user.email}`);

    this.mailerService
      .sendMail({
        to: user.email, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'ft_transcendence 2FA 코드입니다. ✔', // Subject line
        text: 'welcome', // plaintext body
        html: `<b>${randomNumber}</b>`, // HTML body content
      })
      .then(async (e) => {
        this.logger.log(`mailerService: sendMail successed: ${JSON.stringify(e)}`);
        this.logger.log(`setTwoFactorAuthValid: user = ${JSON.stringify(user)}`);
        await this.usersRepository.save(user);
      })
      .catch((e) => {
        this.logger.log(`mailerService: sendMail error: ${JSON.stringify(e)}`);
        throw new InternalServerErrorException(`Internal Server Error in getTwoFactorAuthCode`);
      });
    return {
      statusCode: 200,
      message: 'Successed',
    };
  }

  /**
   * two-factor authentication 코드 확인
   * @param id
   * @param code
   * @returns randomNumber
   */
  async checkTwoFactorAuthCode(id: number, code: string): Promise<Object> {
    const user = await this.getUser(id);

    this.logger.log(`checkTwoFactorAuthCode: user = ${JSON.stringify(user)}`);

    if (!user.tfa_code) {
      throw new NotFoundException(`코드가 없습니다.`);
    }
    if (user.tfa_code !== code) {
      throw new NotAcceptableException(`코드가 올바르지 않습니다`);
    }
    return {
      statusCode: 200,
      message: '성공',
    };
  }

  /**
   * 유저 게임 점수
   * @param user
   * @returns
   */
  updateUserRatio = (user: Users) => {
    const ratio = Math.round((user.wins / (user.wins + user.losses)) * 100) / 100;

    return ratio;
  };

  /**
   * 게임 결과 업데이트
   * @param user
   * @param isWinner
   * @returns
   */
  async updateStats(user: Users, isWinner: boolean) {
    if (isWinner) {
      user.wins += 1;
    } else {
      user.losses += 1;
    }
    user.ratio = this.updateUserRatio(user);

    const updatedUser = await this.usersRepository.save(user);
    // await this.achievementsService.checkUserAchievement(user, 'wins', user.wins);
    // await this.achievementsService.checkUserAchievement(user, 'games', user.games.length + 1);
    return updatedUser;
  }
}
