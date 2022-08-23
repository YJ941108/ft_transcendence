import { Socket } from 'socket.io';
import { GameMode, UserStatus } from '../../../enums/games.enum';

/**
 * @class 소켓에 접속한 유저 클래스
 */
export class User {
  id: number;
  nickname: string;
  wins?: number;
  losses?: number;
  ratio?: number;
  photo?: string;
  status?: UserStatus;
  socketId?: string;
  roomId?: string;
  mode?: GameMode;

  /**
   * @constructor
   * @param id
   * @param nickname
   * @param socketId
   * @param ratio
   */
  constructor(
    id: number,
    nickname: string,
    photo: string,
    wins?: number,
    losses?: number,
    ratio?: number,
    socketId?: string,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.photo = photo;
    this.wins = wins;
    this.losses = losses;
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
    if (mode === 'BIG') {
      this.mode = GameMode.BIG;
    } else {
      this.mode = GameMode.DEFAULT;
    }
  }
}
