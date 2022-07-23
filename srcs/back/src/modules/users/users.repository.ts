import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { UserActionDto } from './dto/user-action.dto';
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
    actionFriendsDto: UserActionDto,
    relations: Array<string>,
  ): Promise<{ user: Users; another: Users }> {
    const logger = new Logger('preProcessForFriends');

    /** 유저 검색 */
    const { id, nickname } = actionFriendsDto;
    const user = await this.findOne(
      { id },
      {
        relations: relations,
      },
    );
    const another = await this.findOne({ nickname });

    /** 예외 처리 */
    if (!another) {
      throw new BadRequestException('유저가 없습니다.');
    }
    if (user.id === another.id) {
      throw new BadRequestException('자기 자신에게는 할 수 없습니다.');
    }

    return {
      user,
      another,
    };
  }

  /**
   * 친구 요청
   * 1. 이미 친구이면 요청할 수 없음
   * @param actionFriendsDto
   * @returns
   */
  async friendRequest(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 중복 처리 */
    user.friendsRequest.map((e: { id: number }) => {
      if (e.id === another.id) {
        throw new BadRequestException('이미 요청을 했습니다');
      }
    });
    user.friends.map((e: { id: number }) => {
      if (e.id === another.id) {
        throw new BadRequestException('이미 친구입니다');
      }
    });

    /** 데이터 삽입 */
    user.friendsRequest.push(another);
    user.save();
    return user;
  }

  /**
   * 친구 수락
   * 1. 친구 요청이 온 경우만 수락할 수 있음
   * @param actionFriendsDto
   * @returns
   */
  async friendAccept(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 이미 친구인지 확인 */
    user.friends.map((e: { id: number }) => {
      if (e.id === another.id) {
        throw new BadRequestException('이미 친구입니다');
      }
    });

    /** 친구 요청이 왔는지 확인 */
    let hasFriendRequest = false;
    user.friendsRequest.map((e: { id: number }) => {
      if (e.id === another.id) {
        hasFriendRequest = true;
      }
    });

    /** 친구 요청이 없는 경우 */
    if (!hasFriendRequest) {
      throw new BadRequestException('요청이 오지 않았습니다.');
    }

    /** 데이터 삽입 */
    user.friends.push(another);
    const index = user.friendsRequest.findIndex((e) => e.id === another.id);
    user.friendsRequest.splice(index, 1);
    user.save();
    return user;
  }

  async friendDeny(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 이미 친구인지 확인 */
    user.friends.map((e: { id: number }) => {
      if (e.id === another.id) {
        throw new BadRequestException('이미 친구입니다');
      }
    });

    /** 친구 요청이 왔는지 확인 */
    let hasFriendRequest = false;
    user.friendsRequest.map((e: { id: number }) => {
      if (e.id === another.id) {
        hasFriendRequest = true;
      }
    });

    /** 친구 요청이 없는 경우 */
    if (!hasFriendRequest) {
      throw new BadRequestException('요청이 오지 않았습니다.');
    }

    /** 데이터 삭제 */
    const index = user.friendsRequest.findIndex((e) => e.id === another.id);
    user.friendsRequest.splice(index, 1);
    user.save();
    return user;
  }

  async frinedDelete(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['friendsRequest', 'friends']);

    /** 이미 친구등록이 되어있는지 확인 */
    let isFriend = false;
    user.friends.map((e: { id: number }) => {
      if (e.id === another.id) {
        isFriend = true;
      }
    });

    /** 예외 처리 */
    if (!isFriend) {
      throw new BadRequestException('친구가 아닙니다');
    }

    const index = user.friends.findIndex((e) => e.id === another.id);
    user.friends.splice(index, 1);
    user.save();
    return user;
  }

  async userBlock(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['blockedUsers']);

    /** 이미 차단되어 있는지 확인 */
    let isBlocked = false;
    user.blockedUsers.map((e: { id: number }) => {
      if (e.id === another.id) {
        isBlocked = true;
      }
    });

    /** 예외 처리 */
    if (isBlocked) {
      throw new BadRequestException('이미 차단되어 있습니다.');
    }

    user.blockedUsers.push(another);
    user.save();
    return user;
  }

  async userRelease(actionFriendsDto: UserActionDto): Promise<Users> {
    let { user, another } = await this.preProcessForFriends(actionFriendsDto, ['blockedUsers']);

    /** 이미 차단되어 있는지 확인 */
    let isBlocked = false;
    user.blockedUsers.map((e: { id: number }) => {
      if (e.id === another.id) {
        isBlocked = true;
      }
    });

    /** 예외 처리 */
    if (!isBlocked) {
      throw new BadRequestException('차단 목록에 없습니다');
    }

    const index = user.blockedUsers.findIndex((e) => e.id === another.id);
    user.blockedUsers.splice(index, 1);
    user.save();
    return user;
  }
}
