import {
  BALL_ACCELERATION,
  BALL_MAX_SPEED,
  BALL_DEFAULT_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  BALL_DEFAULT_SPEED,
} from '../../../constants/games.constant';
import { Paddle } from './game-paddle.class';

export interface IBall {
  x: number;
  y: number;
  r: number;
  speed: number;
  acceleration: number;
  velocity: { dx: number; dy: number };
  goal: boolean;
  color: string;
}

export class Ball implements IBall {
  x: number;
  y: number;
  r: number;

  speed: number;
  acceleration: number;
  velocity: { dx: number; dy: number };
  goal: boolean;
  color: string;

  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.r = BALL_DEFAULT_RADIUS;

    this.speed = BALL_DEFAULT_SPEED;
    this.acceleration = BALL_ACCELERATION;

    this.velocity = { dx: this.speed * (Math.random() < 0.5 ? 1 : -1), dy: 0 };
    this.goal = false;
    this.color = 'white';
  }

  reset() {
    let dir = this.x < CANVAS_WIDTH / 2 ? -1 : 1;
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.speed = BALL_DEFAULT_SPEED;
    this.velocity = { dx: dir * this.speed, dy: 0 };
  }

  update(secondPassed: number, p1: Paddle, p2: Paddle) {
    if (this.r < BALL_DEFAULT_RADIUS) this.r += 1;

    if (!this.handleCollision(secondPassed, p1, p2)) {
      this.x += this.velocity.dx * secondPassed;
      this.y += this.velocity.dy * secondPassed;
    }

    // Goal Paddle one
    if (this.x + this.r >= CANVAS_WIDTH && this.goal === false) {
      p1.goal++;
      this.goal = true;
    }

    //Goal player two
    if (this.x - this.r <= 0 && this.goal === false) {
      p2.goal++;
      this.goal = true;
    }
  }

  handleCollision(secondPassed: number, p1: Paddle, p2: Paddle) {
    // Collision on the borders of the board game
    let nextPosY: number = this.y + this.velocity.dy * secondPassed;

    if (nextPosY - this.r <= 0 || nextPosY + this.r >= 1080) {
      this.velocity.dy = -this.velocity.dy;
      this.r -= 5;
    }

    // Detect a collision between he ball and a Paddle
    if (this.collision(secondPassed, p1, p2)) {
      if (this.speed + this.acceleration < BALL_MAX_SPEED) this.speed += this.acceleration;
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

  // Collision between ball and Paddle
  collision(secondPassed: number, p1: Paddle, p2: Paddle): boolean {
    let nextPosX: number = this.x + this.velocity.dx * secondPassed;
    if (this.x < CANVAS_WIDTH / 2) {
      if (nextPosX - this.r < p1.x + p1.width) {
        if (
          (this.y + this.r >= p1.y && this.y + this.r <= p1.y + p1.height) ||
          (this.y - this.r >= p1.y && this.y - this.r <= p1.y + p1.height)
        ) {
          this.x = p1.x + p1.width + this.r;
          this.r -= 5;
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
          this.r -= 5;
          p2.color = 'rgba(127, 0, 0, 0.8)';
          return true;
        }
      }
    }
    return false;
  }
}
