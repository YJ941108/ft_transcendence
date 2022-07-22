import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ActionFriendsDto } from './dto/action-friends.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './users.entity';

/**
 *
 */
@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  /**
   *
   * @param createUserDto
   */
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { username, email, photo, nickname } = createUserDto;
    const user = this.create({
      username,
      email,
      photo,
      nickname,
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

  /**
   * 친구 요청
   * @param actionFriendsDto
   * @returns
   */
  async friendsRequest(actionFriendsDto: ActionFriendsDto): Promise<Users> {
    const logger = new Logger('friendsRequest');

    /** 유저 검색 */
    const { id, nickname } = actionFriendsDto;
    const user = await this.findOne(
      { id },
      {
        relations: ['friendsRequest'],
      },
    );
    const friend = await this.findOne({ nickname });

    /** 예외 처리 */
    if (user.id === friend.id) {
      throw new BadRequestException('자기 자신에게는 할 수 없습니다.');
    }

    /** 중복 처리 */
    const friendsRequest: Array<Users> = user.friendsRequest;
    let isFriend: boolean = false;
    friendsRequest.map((e: { id: number }) => {
      if (e.id === friend.id) {
        isFriend = true;
        throw new BadRequestException('이미 요청을 했습니다');
      }
    });

    /** 데이터 삽입 */
    if (!isFriend) {
      friendsRequest.push(friend);
    }
    user.save();
    return user;
  }
}
