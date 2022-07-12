import { Logger } from '@nestjs/common';
import { defaultMaxUser } from 'src/constants/games.constant';
import { User } from './user.class';

export default class Queue {
  /** queue는 Array<User> 즉 유저를 담는 배열 */
  private queue: Array<User> = new Array();
  private logger: Logger = new Logger('Class Queue');

  /**
   * Array의 용량 설정
   * @constructor
   * @param capacity
   */
  constructor(private capacity: number = defaultMaxUser) {}

  /**
   * User를 Array에 push
   * @param user
   */
  enqueue(user: User): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
    }
    this.queue.push(user);
    this.logger.log(`enqueue: ${user.nickname}`);
  }

  /**
   * Array에서 User제거하고 return
   * @returns
   */
  dequeue(): User | undefined {
    return this.queue.shift();
  }

  /**
   * Array legnth return
   * @returns
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Nickname으로 User찾아서 return
   * @param nickname
   * @returns
   */
  getUserByNickname(nickname: string): User {
    this.logger.log(`getUserByNickname: ${nickname}`);
    return this.queue.find((element) => element.nickname === nickname);
  }

  /**
   * User remove
   * @param user
   */
  removeUser(user: User): void {
    let index: number = this.queue.findIndex((element) => element.nickname === user.nickname);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
    this.logger.log(`removeUser: ${user.nickname}`);
  }

  /**
   * @param user
   * @returns boolean
   */
  isInQueue(user: User): boolean {
    this.logger.log(`isInQueue: ${user.nickname}`);
    return this.getUserByNickname(user.nickname) !== undefined;
  }

  /**
   * 가장 차이가 적은 ratio의 유저와 매칭
   * @returns
   */
  matchPlayers(): User[] {
    let players: User[] = Array();
    let firstPlayer: User = this.dequeue();

    let secondPlayerId: number = 0;
    let difference: number = Math.abs(firstPlayer.ratio - this.queue[0].ratio);

    for (let i = 1; i < this.size(); i++) {
      if (firstPlayer.mode === this.queue[i].mode && Math.abs(firstPlayer.ratio - this.queue[i].ratio) < difference)
        secondPlayerId = i;
    }

    if (firstPlayer.mode !== this.queue[secondPlayerId].mode) {
      this.queue.splice(1, 0, firstPlayer);
      return players;
    }

    players.push(firstPlayer);
    players.push(this.queue[secondPlayerId]);
    this.queue.splice(secondPlayerId, 1);

    return players;
  }
}
