import { User } from './user.class';
import { UserStatus } from '../../../enums/games.enum';
import { DEFAULT_MAX_USER } from 'src/constants/games.constant';
import { Logger } from '@nestjs/common';

/** 소켓에 접속한 유저 전체이며 Array로 메모리에 저장 */
export class ConnectedUsers {
  private users: Array<User> = new Array();
  private logger: Logger = new Logger('Class ConnectedUsers');

  /**
   * @constructor
   * @param maxUser Array 크기
   */
  constructor(private maxUser: number = DEFAULT_MAX_USER) {}

  /**
   * connectedUsers에 유저 추가
   * @param user User 객체
   */
  addUser(user: User) {
    if (this.maxUser !== this.users.length) this.users.push(user);
  }

  /**
   * connectedUsers에 유저 제거
   * @param user User 객체
   */
  removeUser(user: User) {
    let index: number = this.users.findIndex((element) => element.socketId === user.socketId);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    this.logger.log(`removeUser: ${user.nickname}`);
  }

  /**
   *
   * @param socketId
   * @returns 찾은 User 객체
   */
  getUserBySocketId(socketId: string): User | undefined {
    let index: number = this.users.findIndex((element) => element.socketId === socketId);
    if (index === -1) {
      return undefined;
    }
    return this.users[index];
  }

  /**
   *
   * @param id
   * @returns
   */
  getUserById(id: number): User | undefined {
    let index: number = this.users.findIndex((element) => element.id === id);
    if (index === -1) {
      return undefined;
    }
    return this.users[index];
  }

  /**
   *
   * @param socketId
   * @param status
   */
  changeUserStatus(socketId: string, status: UserStatus) {
    let user: User = this.getUserBySocketId(socketId);
    user.setUserStatus(status);
  }

  /**
   * 게임 모드 설정
   * @param socketId
   * @param mode
   */
  setGameMode(socketId: string, mode: string) {
    let user: User = this.getUserBySocketId(socketId);
    user.setMode(mode);
  }
}
