import { User } from './user.class';
import { Paddle } from './game-paddle.class';
import { Ball } from './game-ball.class';
import { CANVAS_WIDTH, MAX_GOAL } from '../../../constants/games.constant';
import { GameMode, GameState } from '../../../enums/games.enum';

/**
 * roomId
 * gameState
 * players
 * paddleOne
 * paddleTwo
 * ball
 * timestampStart
 * lastUpdate
 * goalTimestamp
 * pauseTime
 * maxGoal
 * timer
 * gameDuration
 */
export interface IRoom {
  roomId: string;
  gameState: GameState;
  players: User[];
  paddleOne: Paddle;
  paddleTwo: Paddle;
  ball: Ball;
  timestampStart: number;
  lastUpdate: number;
  goalTimestamp: number;
  pauseTime: { pause: number; resume: number }[];
  maxGoal: number;
  timer: number;
  gameDuration: number;
}

/**
 *  소켓에 데이터를 보내기 위해서 사용됨
 */
export type SerializeRoom = {
  roomId: string;
  gameState: GameState;
  paddleOne: {
    user: {
      id: number;
      nickname: string;
    };
    width: number;
    height: number;
    x: number;
    y: number;
    color: string;
    goal: number;
  };
  paddleTwo: {
    user: {
      id: number;
      nickname: string;
    };
    width: number;
    height: number;
    x: number;
    y: number;
    color: string;
    goal: number;
  };
  ball: {
    x: number;
    y: number;
    r: number;
    color: string;
  };
  timestampStart: number;
  goalTimestamp: number;
  pauseTime: {
    pause: number;
    resume: number;
  }[];
  mode: number;
  timer: number;
  gameDuration: number;
};

/**
 *
 */
export default class Room implements IRoom {
  roomId: string;
  gameState: GameState;
  players: User[];
  spectators: User[];
  paddleOne: Paddle;
  paddleTwo: Paddle;
  ball: Ball;
  timestampStart: number;
  lastUpdate: number;
  goalTimestamp: number;
  pauseTime: { pause: number; resume: number }[];
  isGameEnd: boolean;
  maxGoal: number;
  mode: GameMode;
  timer: number;
  gameDuration: number;

  /**
   *
   * @param roomId
   * @param users
   * @param customisation
   */
  constructor(roomId: string, users: User[], customisation: { mode?: GameMode } = { mode: GameMode.DEFAULT }) {
    this.roomId = roomId;
    this.gameState = GameState.STARTING;
    this.players = [];
    this.spectators = [];
    this.paddleOne = new Paddle(users[0], 10, customisation.mode);
    this.paddleTwo = new Paddle(users[1], CANVAS_WIDTH - 40, customisation.mode);
    this.ball = new Ball(customisation.mode);
    this.timestampStart = Date.now();
    this.lastUpdate = Date.now();
    this.goalTimestamp = Date.now();
    this.pauseTime = [];
    this.mode = customisation.mode;
    this.maxGoal = MAX_GOAL;
    this.isGameEnd = false;
    this.timer = 0;
    this.gameDuration = 60000 * 5; // 1min * num of minutes
  }

  /**
   *
   * @param user
   * @returns
   */
  isAPlayer(user: User): boolean {
    return this.paddleOne.user.nickname === user.nickname || this.paddleTwo.user.nickname === user.nickname;
  }

  isASpectator(users: User): boolean {
    const index = this.spectators.findIndex((value) => {
      return value.id === users.id;
    });
    if (index === -1) {
      return false;
    }
    return true;
  }

  findOne(user: User): number {
    return this.players.findIndex((element) => element.id === user.id);
  }

  /**
   *
   * @param user
   */
  addUser(user: User) {
    this.players.push(user);
  }

  addSpectator(user: User) {
    this.spectators.push(user);
  }

  getUsers(): User[] {
    return this.players;
  }

  /**
   *
   * @param user
   */
  removeUser(user: User) {
    const userIndex: number = this.players.findIndex((value) => value.nickname === user.nickname);
    if (userIndex !== -1) this.players.splice(userIndex, 1);
  }

  removeSpectator(user: User) {
    const userIndex: number = this.spectators.findIndex((value) => value.nickname === user.nickname);
    if (userIndex !== -1) this.spectators.splice(userIndex, 1);
  }

  /**
   *
   * @returns
   */
  getDuration(): number {
    let duration: number = Date.now() - this.timestampStart;

    this.pauseTime.forEach((pause) => {
      duration -= pause.pause - pause.resume - 3500;
    });
    return duration;
  }

  /**
   * 게임 상태 변경
   * PLAYER_ONE_WIN
   * PLAYER_TWO_WIN
   *
   * @param newGameState
   */
  changeGameState(newGameState: GameState): void {
    this.gameState = newGameState;
  }

  /**
   *
   */
  start(): void {
    this.timestampStart = Date.now();
    this.lastUpdate = Date.now();
    this.changeGameState(GameState.PLAYING);
  }

  /**
   *
   */
  pause(): void {
    this.changeGameState(GameState.PAUSED);
    this.pauseTime.push({ pause: Date.now(), resume: Date.now() });
  }

  /**
   *
   */
  resume(): void {
    this.changeGameState(GameState.RESUMED);
    this.pauseTime.push({ pause: Date.now(), resume: Date.now() });
  }

  /**
   *
   */
  resetPosition(): void {
    this.paddleOne.reset();
    this.paddleTwo.reset();
    this.ball.reset(this.mode);
  }

  /**
   *
   */
  updateTimer() {
    let time: number = Date.now() - this.timestampStart;
    this.pauseTime.forEach((pause) => {
      time += pause.pause - pause.resume - 3500;
    });
    this.timer = time;
  }

  /**
   * 점수가 났을 때 실행하는 함수
   */
  checkGoal() {
    /** 점수가 났을 때 */
    if (this.ball.goal === true) {
      this.goalTimestamp = this.lastUpdate;

      /**
       * 최대 점수에 도달했다면 -> PLAYER_WIN
       * 그렇지 않으면 -> PLAYER_SCORED
       */
      if (
        (this.mode === GameMode.DEFAULT || this.mode === GameMode.BIG) &&
        (this.paddleOne.goal === this.maxGoal || this.paddleTwo.goal === this.maxGoal)
      ) {
        if (this.paddleOne.goal === this.maxGoal) {
          this.changeGameState(GameState.PLAYER_ONE_WIN);
        } else if (this.paddleTwo.goal === this.maxGoal) {
          this.changeGameState(GameState.PLAYER_TWO_WIN);
        }
        this.isGameEnd = true;
      } else {
        if (this.ball.x < CANVAS_WIDTH / 2) {
          this.changeGameState(GameState.PLAYER_TWO_SCORED);
        } else {
          this.changeGameState(GameState.PLAYER_ONE_SCORED);
        }
      }
      this.ball.goal = false;
    }

    // if (
    //   this.mode === GameMode.TIMER &&
    //   this.paddleOne.goal !== this.paddleTwo.goal &&
    //   this.timer >= this.gameDuration
    // ) {
    //   if (this.paddleOne.goal > this.paddleTwo.goal) this.changeGameState(GameState.PLAYER_ONE_WIN);
    //   else this.changeGameState(GameState.PLAYER_TWO_WIN);
    //   this.isGameEnd = true;
    // }
  }

  /**
   *
   */
  update(currentTimestamp: number): void {
    let secondPassed: number = (currentTimestamp - this.lastUpdate) / 1000;
    this.lastUpdate = currentTimestamp;

    this.paddleOne.update(secondPassed);
    this.paddleTwo.update(secondPassed);
    this.ball.update(secondPassed, this.paddleOne, this.paddleTwo);
    this.checkGoal();
  }

  /**
   *
   */
  pauseForfait() {
    if (this.players[0].id === this.paddleOne.user.id) {
      this.changeGameState(GameState.PLAYER_ONE_WIN);
    } else {
      this.changeGameState(GameState.PLAYER_TWO_WIN);
    }
  }

  /**
   *
   */
  serialize(): SerializeRoom {
    const newSerializeRoom: SerializeRoom = {
      roomId: this.roomId,
      gameState: this.gameState,
      paddleOne: {
        user: {
          id: this.paddleOne.user.id,
          nickname: this.paddleOne.user.nickname,
        },
        width: this.paddleOne.width,
        height: this.paddleOne.height,
        x: this.paddleOne.x,
        y: this.paddleOne.y,
        color: this.paddleOne.color,
        goal: this.paddleOne.goal,
      },
      paddleTwo: {
        user: {
          id: this.paddleTwo.user.id,
          nickname: this.paddleTwo.user.nickname,
        },
        width: this.paddleTwo.width,
        height: this.paddleTwo.height,
        x: this.paddleTwo.x,
        y: this.paddleTwo.y,
        color: this.paddleTwo.color,
        goal: this.paddleTwo.goal,
      },
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        r: this.ball.r,
        color: this.ball.color,
      },
      timestampStart: this.timestampStart,
      goalTimestamp: this.goalTimestamp,
      pauseTime: this.pauseTime,
      mode: this.mode,
      timer: this.timer,
      gameDuration: this.gameDuration,
    };
    return newSerializeRoom;
  }
}
