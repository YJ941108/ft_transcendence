import * as PIXI from 'pixi.js';
import { Socket } from 'socket.io-client';
import { IRoom } from './GameInterfaces';

interface IPaddleInfo {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface IBallInfo {
	color: string;
	radius: number;
	x: number;
	y: number;
}

export default class GameData {
	private room: IRoom;

	private socket: Socket;

	private app: PIXI.Application;

	private ball: PIXI.Graphics;

	private leftPaddle: PIXI.Graphics;

	private rightPaddle: PIXI.Graphics;

	// private isLeft: boolean | undefined;

	constructor(socketProps: Socket, roomDataProps: IRoom) {
		this.socket = socketProps;
		this.room = roomDataProps;
		const leftPaddleInfo: IPaddleInfo = {
			x: this.room.paddleOne.x,
			y: this.room.paddleOne.y,
			width: this.room.paddleOne.width,
			height: this.room.paddleOne.height,
		};

		const rightPaddleInfo: IPaddleInfo = {
			x: this.room.paddleTwo.x,
			y: this.room.paddleTwo.y,
			width: this.room.paddleTwo.width,
			height: this.room.paddleTwo.height,
		};

		const ballInfo: IBallInfo = {
			color: this.room.ball.color,
			radius: this.room.ball.r,
			x: this.room.ball.x,
			y: this.room.ball.y,
		};
		this.app = new PIXI.Application({
			view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			backgroundColor: 0x696969,
			width: 1920,
			height: 1080,
		});

		this.leftPaddle = new PIXI.Graphics();
		this.leftPaddle.beginFill(0xff0000);
		this.leftPaddle.drawRect(leftPaddleInfo.x, leftPaddleInfo.y, leftPaddleInfo.width, leftPaddleInfo.height);
		this.leftPaddle.endFill();

		this.rightPaddle = new PIXI.Graphics();
		this.rightPaddle.beginFill(0xff0000);
		this.rightPaddle.drawRect(rightPaddleInfo.x, rightPaddleInfo.y, rightPaddleInfo.width, rightPaddleInfo.height);
		this.rightPaddle.endFill();

		this.ball = new PIXI.Graphics();
		this.ball.beginFill(0xff0000);
		this.ball.drawCircle(ballInfo.x, ballInfo.y, ballInfo.radius);
		this.ball.endFill();

		this.app.stage.addChild(this.leftPaddle);
		this.app.stage.addChild(this.rightPaddle);
		this.app.stage.addChild(this.ball);
	}

	setBallPosition(x: number, y: number) {
		this.ball.x = x;
		this.ball.y = y;
	}

	setLeftPaddlePosition(y: number) {
		this.leftPaddle.y = y;
	}

	setRightPaddlePosition(y: number) {
		this.rightPaddle.y = y;
	}
}
