import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import e from 'express';
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

  async preProcessForFriends(
    actionFriendsDto: ActionFriendsDto,
    relations: Array<string>,
  ): Promise<{ user: Users; friend: Users }> {
    const logger = new Logger('preProcessForFriends');

    /** 유저 검색 */
    const { id, nickname } = actionFriendsDto;
    const user = await this.findOne(
      { id },
      {
        relations: relations,
      },
    );
    const friend = await this.findOne({ nickname });

    /** 예외 처리 */
    if (!friend) {
      throw new BadRequestException('유저가 없습니다.');
    }
    if (user.id === friend.id) {
      throw new BadRequestException('자기 자신에게는 할 수 없습니다.');
    }

    return {
      user,
      friend,
    };
  }

  /**
   * 친구 요청
   * 1. 이미 친구이면 요청할 수 없음
   * @param actionFriendsDto
   * @returns
   */
  async friendsRequest(actionFriendsDto: ActionFriendsDto): Promise<Users> {
    let { user, friend } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 중복 처리 */
    user.friendsRequest.map((e: { id: number }) => {
      if (e.id === friend.id) {
        throw new BadRequestException('이미 요청을 했습니다');
      }
    });
    user.friends.map((e: { id: number }) => {
      if (e.id === friend.id) {
        throw new BadRequestException('이미 친구입니다');
      }
    });

    /** 데이터 삽입 */
    user.friendsRequest.push(friend);
    user.save();
    return user;
  }

  /**
   * 친구 수락
   * 1. 친구 요청이 온 경우만 수락할 수 있음
   * @param actionFriendsDto
   * @returns
   */
  async friendsAccept(actionFriendsDto: ActionFriendsDto): Promise<Users> {
    let { user, friend } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 친구 요청이 왔는지 확인 */
    let hasFriendRequest = false;
    user.friendsRequest.map((e: { id: number }) => {
      if (e.id === friend.id) {
        hasFriendRequest = true;
      }
    });

    /**
     * 예외 처리
     * 친구 요청이 없는 경우
     * 친구 요청이 있는 경우 -> 이미 친구인지 확인
     */
    if (!hasFriendRequest) {
      throw new BadRequestException('요청이 오지 않았습니다.');
    } else {
      user.friends.map((e: { id: number }) => {
        if (e.id === friend.id) {
          throw new BadRequestException('이미 친구입니다');
        }
      });
    }

    /** 데이터 삽입 */
    user.friends.push(friend);
    user.save();
    return user;
  }
}
