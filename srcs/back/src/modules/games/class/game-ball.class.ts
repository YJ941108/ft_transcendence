import { GameMode } from 'src/enums/games.enum';
import {
  BALL_ACCELERATION,
  BALL_MAX_SPEED,
  BALL_DEFAULT_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  BALL_DEFAULT_SPEED,
} from '../../../constants/games.constant';
import { Paddle } from './game-paddle.class';

/**
 * x: 공의 가로 위치
 * y: 공의 세로 위치
 * r: 공의 반지름
 * speed: 공의 초기 속력
 * acceleration: 공의 가속도
 * velocity: 공의 속도
 * goal: 공이 왼쪽, 오른쪽 벽에 닿으면 true
 * color: 색상
 */
export interface IBall {
  x: number;
  y: number;
  r: number;
  speed: number;
  acceleration: number;
  velocity: {
    dx: number;
    dy: number;
  };
  goal: boolean;
  color: string;
}

export class Ball implements IBall {
  x: number;
  y: number;
  r: number;
  speed: number;
  acceleration: number;
  velocity: {
    dx: number;
    dy: number;
  };
  goal: boolean;
  color: string;

  /**
   * velocity의 Math.random()에 의해 공이 시작할 때 왼쪽으로 갈지, 오른쪽으로 갈지 정해진다.
   */
  constructor(mode: GameMode) {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    if (mode === GameMode.BIG) {
      this.r = BALL_DEFAULT_RADIUS * 5;
    } else {
      this.r = BALL_DEFAULT_RADIUS;
    }
    this.speed = BALL_DEFAULT_SPEED;
    this.acceleration = BALL_ACCELERATION;
    this.velocity = {
      dx: (this.speed * (Math.random() < 0.5 ? 1 : -1)) / 2,
      dy: (this.speed * (Math.random() < 0.5 ? 1 : -1)) / 2,
    };
    this.goal = false;
    this.color = 'white';
  }

  /**
   * 공 초기화
   */
  reset() {
    let dir = this.x < CANVAS_WIDTH / 2 ? -1 : 1;
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.speed = BALL_DEFAULT_SPEED;
    this.velocity = {
      dx: dir * this.speed,
      dy: dir * this.speed,
    };
  }

  /**
   * Collision between ball and Paddle
   * @param secondPassed
   * @param p1
   * @param p2
   * @returns
   */
  collision(secondPassed: number, p1: Paddle, p2: Paddle): boolean {
    let nextPosX: number = this.x + this.velocity.dx * secondPassed;

    if (this.x < CANVAS_WIDTH / 2) {
      if (nextPosX - this.r < p1.x + p1.width) {
        if (
          (this.y + this.r >= p1.y && this.y + this.r <= p1.y + p1.height) ||
          (this.y - this.r >= p1.y && this.y - this.r <= p1.y + p1.height)
        ) {
          this.x = p1.x + p1.width + this.r;
          // this.r -= 5;
          p1.color = 'rgba(127, 0, 0, 0.8)';
          return true;
        }
      }
    } else {
      if (nextPosX + this.r > p2.x) {
        if (
          (this.y + this.r >= p2.y && this.y + this.r <= p2.y + p2.height) ||
          (this.y - this.r >= p2.y && this.y - this.r <= p2.y + p2.height)
        ) {
          this.x = p2.x - this.r;
          // this.r -= 5;
          p2.color = 'rgba(127, 0, 0, 0.8)';
          return true;
        }
      }
    }
    return false;
  }

  /**
   *
   * @param secondPassed
   * @param p1
   * @param p2
   * @returns
   */
  handleCollision(secondPassed: number, p1: Paddle, p2: Paddle) {
    // Collision on the borders of the board game
    let nextPosY: number = this.y + this.velocity.dy * secondPassed;

    if (nextPosY - this.r <= 0 || nextPosY + this.r >= 1080) {
      this.velocity.dy = -this.velocity.dy;
      this.r -= 5;
    }

    // Detect a collision between he ball and a Paddle
    if (this.collision(secondPassed, p1, p2)) {
      if (this.speed + this.acceleration < BALL_MAX_SPEED) {
        this.speed += this.acceleration;
      }

      let p = this.x < CANVAS_WIDTH / 2 ? p1 : p2;
      let collidePoint = this.y - (p.y + p.height / 2);
      collidePoint = collidePoint / (p.height / 2);
      let angleRad = (collidePoint * Math.PI) / 4;
      let dir = this.x < CANVAS_WIDTH / 2 ? 1 : -1;
      this.velocity.dx = dir * (this.speed * Math.cos(angleRad));
      this.velocity.dy = this.speed * Math.sin(angleRad);

      return true;
    }

    return false;
  }

  /**
   *
   * @param secondPassed
   * @param p1
   * @param p2
   */
  update(secondPassed: number, p1: Paddle, p2: Paddle, mode: GameMode) {
    if (mode === GameMode.BIG) {
      if (this.r < BALL_DEFAULT_RADIUS * 5) {
        this.r += 1;
      }
    } else {
      if (this.r < BALL_DEFAULT_RADIUS) {
        this.r += 1;
      }
    }
    if (!this.handleCollision(secondPassed, p1, p2)) {
      this.x += (this.velocity.dx * secondPassed) / 2;
      this.y += (this.velocity.dy * secondPassed) / 2;
    }

    /** Goal Paddle */
    if (this.x + this.r >= CANVAS_WIDTH && this.goal === false) {
      p1.goal++;
      this.goal = true;
    }
    if (this.x - this.r <= 0 && this.goal === false) {
      p2.goal++;
      this.goal = true;
    }
  }
}
