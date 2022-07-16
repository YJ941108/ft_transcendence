import { User } from './user.class';
import { Paddle } from './game-paddle.class';
import { Ball } from './game-ball.class';
import { CANVAS_WIDTH } from '../../../constants/games.constant';
import { GameMode, GameState } from '../../../enums/games.enum';

export interface IRoom {
  roomId: string;
  gameState: GameState;
  paddles: User[];
  paddleOne: Paddle;
  paddleTwo: Paddle;
  ball: Ball;

  // Game timestamps
  timestampStart: number;
  lastUpdate: number;
  goalTimestamp: number;
  pauseTime: { pause: number; resume: number }[];

  // settings customisation
  maxGoal: number;

  timer: number;
  gameDuration: number;
}

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

export default class Room implements IRoom {
  roomId: string;
  gameState: GameState;
  paddles: User[];
  paddleOne: Paddle;
  paddleTwo: Paddle;
  ball: Ball;

  timestampStart: number;
  lastUpdate: number;
  goalTimestamp: number;
  pauseTime: { pause: number; resume: number }[];

  isGameEnd: boolean;

  // settings customisation
  maxGoal: number;
  mode: GameMode;
  timer: number;
  gameDuration: number;

  constructor(roomId: string, users: User[], customisation: { mode?: GameMode } = { mode: GameMode.DEFAULT }) {
    this.roomId = roomId;
    this.gameState = GameState.STARTING;
    this.paddles = [];
    this.paddleOne = new Paddle(users[0], 10);
    this.paddleTwo = new Paddle(users[1], CANVAS_WIDTH - 40);
    this.ball = new Ball();

    this.timestampStart = Date.now();
    this.lastUpdate = Date.now();
    this.goalTimestamp = Date.now();
    this.pauseTime = [];

    this.mode = customisation.mode;
    this.maxGoal = 11;

    this.isGameEnd = false;

    this.timer = 0;
    this.gameDuration = 60000 * 5; // 1min * num of minutes
  }

  isAPlayer(user: User): boolean {
    return this.paddleOne.user.nickname === user.nickname || this.paddleTwo.user.nickname === user.nickname;
  }

  addUser(user: User) {
    this.paddles.push(user);
  }

  removeUser(userRm: User) {
    const userIndex: number = this.paddles.findIndex((user) => user.nickname === userRm.nickname);
    if (userIndex !== -1) this.paddles.splice(userIndex, 1);
  }

  getDuration(): number {
    let duration: number = Date.now() - this.timestampStart;

    this.pauseTime.forEach((pause) => {
      duration -= pause.pause - pause.resume - 3500;
    });
    return duration;
  }

  changeGameState(newGameState: GameState): void {
    this.gameState = newGameState;
  }

  start(): void {
    this.timestampStart = Date.now();
    this.lastUpdate = Date.now();
    this.changeGameState(GameState.PLAYING);
  }

  pause(): void {
    this.changeGameState(GameState.PAUSED);
    this.pauseTime.push({ pause: Date.now(), resume: Date.now() });
  }

  resume(): void {
    this.changeGameState(GameState.RESUMED);
    this.pauseTime[this.pauseTime.length - 1].resume = Date.now();
  }

  resetPosition(): void {
    this.paddleOne.reset();
    this.paddleTwo.reset();
    this.ball.reset();
  }

  updateTimer() {
    let time: number = Date.now() - this.timestampStart;
    this.pauseTime.forEach((pause) => {
      time += pause.pause - pause.resume - 3500;
    });
    this.timer = time;
  }

  checkGoal() {
    if (this.ball.goal === true) {
      this.goalTimestamp = this.lastUpdate;
      if (
        this.mode === GameMode.DEFAULT &&
        (this.paddleOne.goal === this.maxGoal || this.paddleTwo.goal === this.maxGoal)
      ) {
        if (this.paddleOne.goal === this.maxGoal) this.changeGameState(GameState.PLAYER_ONE_WIN);
        else if (this.paddleTwo.goal === this.maxGoal) this.changeGameState(GameState.PLAYER_TWO_WIN);
        this.isGameEnd = true;
      } else {
        if (this.ball.x < CANVAS_WIDTH / 2) this.changeGameState(GameState.PLAYER_TWO_SCORED);
        else this.changeGameState(GameState.PLAYER_ONE_SCORED);
      }
      this.ball.goal = false;
    }

    if (
      this.mode === GameMode.TIMER &&
      this.paddleOne.goal !== this.paddleTwo.goal &&
      this.timer >= this.gameDuration
    ) {
      if (this.paddleOne.goal > this.paddleTwo.goal) this.changeGameState(GameState.PLAYER_ONE_WIN);
      else this.changeGameState(GameState.PLAYER_TWO_WIN);
      this.isGameEnd = true;
    }
  }

  update(currentTimestamp: number): void {
    let secondPassed: number = (currentTimestamp - this.lastUpdate) / 1000;
    this.lastUpdate = currentTimestamp;

    this.paddleOne.update(secondPassed);
    this.paddleTwo.update(secondPassed);
    this.ball.update(secondPassed, this.paddleOne, this.paddleTwo);
    this.checkGoal();
  }

  pauseForfait() {
    if (this.paddles[0].id === this.paddleOne.user.id) this.changeGameState(GameState.PLAYER_ONE_WIN);
    else this.changeGameState(GameState.PLAYER_TWO_WIN);
  }

  serialize(): SerializeRoom {
    // send the littlest amount of data
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
