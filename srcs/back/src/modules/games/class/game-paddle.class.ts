import { User } from './user.class';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  TIMING,
} from '../../../constants/games.constant';
import { GameMode } from 'src/enums/games.enum';

/**
 *
 */
export interface IPaddle {
  user: User;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  goal: number;
  color: string;
  mode: GameMode;
}

/**
 *
 */
export class Paddle implements IPaddle {
  user: User;
  x: number;
  default_x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  goal: number;
  color: string;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  flash: boolean;
  step: number;
  mode: GameMode;

  constructor(user: User, x: number, mode: GameMode) {
    this.user = user;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.x = x;
    this.default_x = x;
    this.y = CANVAS_HEIGHT / 2 - this.height / 2;
    this.speed = PADDLE_SPEED;
    this.goal = 0;
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.color = 'rgba(255, 255, 255, 0.8)';
    this.mode = mode;
  }

  /**
   *
   */
  reset(): void {
    this.y = CANVAS_HEIGHT / 2 - this.height / 2;
    this.x = this.default_x;
  }

  /**
   *
   * @param secondPassed
   */
  update(secondPassed: number): void {
    if (this.color !== 'rgba(255, 255, 255, 0.8)' && this.step <= TIMING) {
      this.color =
        'rgb(' +
        (127 + (this.step / TIMING) * 128) +
        ', ' +
        (this.step / TIMING) * 255 +
        ', ' +
        (this.step / TIMING) * 255 +
        ', 0.8)';
      this.step++;
    } else {
      this.step = 0;
      this.color = 'rgba(255, 255, 255, 0.8)';
    }

    if (this.up && !this.down) {
      if (this.y > 0) {
        this.y -= this.speed * secondPassed;
      } else {
        this.y = 0;
      }
    }

    if (this.down && !this.up) {
      if (this.y + this.height < CANVAS_HEIGHT) {
        this.y += this.speed * secondPassed;
      } else {
        this.y = CANVAS_HEIGHT - this.height;
      }
    }

    if (this.mode === GameMode.BIG && this.left && !this.right) {
      /** Player 1 */
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > (CANVAS_WIDTH / 4) * 2 && this.x < (CANVAS_WIDTH / 4) * 3) {
        this.x = (CANVAS_WIDTH / 4) * 3;
      } else if (this.flash) {
        this.x -= this.speed * secondPassed * 100;
      } else {
        this.x -= this.speed * secondPassed;
      }
    }

    if (this.mode === GameMode.BIG && this.right && !this.left) {
      if (this.x > CANVAS_WIDTH / 4 && this.x < (CANVAS_WIDTH / 4) * 2) {
        this.x = CANVAS_WIDTH / 4;
      } else if (this.x > CANVAS_WIDTH - this.width) {
        this.x = CANVAS_WIDTH - this.width;
      } else if (this.flash) {
        this.x += this.speed * secondPassed * 100;
      } else {
        this.x += this.speed * secondPassed;
      }
    }
  }
}
