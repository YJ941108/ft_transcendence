import { Logger } from '@nestjs/common';
import { GameMode, UserStatus } from '../../../enums/games.enum';

/**
 * @class 소켓에 접속한 유저 클래스
 */
export class User {
  id: number;
  nickname: string;
  ratio?: number;
  status?: UserStatus;
  socketId?: string;
  roomId?: string;
  mode?: GameMode;
  private logger: Logger = new Logger('Class User');

  /**
   * @constructor
   * @param id
   * @param nickname
   * @param socketId
   * @param ratio
   */
  constructor(id: number, nickname: string, socketId?: string, ratio?: number) {
    this.id = id;
    this.nickname = nickname;
    this.ratio = ratio;
    this.socketId = socketId;
  }

  /**
   * @function
   * @param nickname
   * @return
   */
  setNickname(nickname: string) {
    this.nickname = nickname;
  }

  /**
   *
   * @param status
   */
  setUserStatus(status: UserStatus) {
    this.status = status;
  }

  /**
   *
   * @param socketId
   */
  setSocketId(socketId: string) {
    this.socketId = socketId;
  }

  /**
   *
   * @param roomId
   */
  setRoomId(roomId: string | undefined) {
    this.roomId = roomId;
  }

  /**
   *
   * @param mode
   */
  setMode(mode: string) {
    if (mode === 'timer') {
      this.mode = GameMode.TIMER;
    } else {
      this.mode = GameMode.DEFAULT;
    }
  }
}
