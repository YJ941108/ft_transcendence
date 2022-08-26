import { canvasWidth, canvasHeight, IBall, IPlayer, IRoom } from './GameInterfaces';

type Net = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export default class GameData {
	canvas: HTMLCanvasElement;

	room: any;

	context: CanvasRenderingContext2D | null;

	paddleOne: IPlayer;

	paddleTwo: IPlayer;

	ball: IBall;

	degrees: number;

	screenWidth: number;

	screenHeight: number;

	net: Net;

	constructor(roomProps: IRoom) {
		this.canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
		this.context = this.canvas.getContext('2d');
		this.degrees = 0;
		this.screenWidth = canvasWidth;
		this.screenHeight = canvasHeight;
		this.room = roomProps;
		this.paddleOne = this.room.paddleOne;
		this.paddleTwo = this.room.paddleTwo;
		this.ball = this.room.ball;
		this.net = {
			x: canvasWidth / 2 - 10,
			y: 0,
			width: 20,
			height: 50,
		};
	}

	drawRectangle(x: number, y: number, width: number, height: number, color: string) {
		if (this.context) {
			this.context.save();
			this.context.fillStyle = color;
			this.context.fillRect(x, y, width, height);
			this.context.restore();
		}
	}

	drawPaddle(paddleData: IPlayer) {
		if (this.context) {
			this.context.save();
			this.context.fillStyle = paddleData.color;
			this.context.fillRect(paddleData.x, paddleData.y, paddleData.width, paddleData.height);
			this.context.restore();
		}
	}

	drawBall(ballData: IBall) {
		if (this.context) {
			this.context.save();
			this.context.beginPath();
			this.context.arc(ballData.x, ballData.y, ballData.r, 0, 2 * Math.PI);
			this.context.fillStyle = ballData.color;
			this.context.fill();
			this.context.stroke();
			this.context.restore();
		}
	}

	drawTexture(text: string, x: number, y: number, size: number, color: string) {
		if (this.context) {
			this.context.save();
			this.context.fillStyle = color;
			this.context.font = `${size}px RetroGaming`;
			this.context.fillText(text, x, y);
			this.context.restore();
		}
	}

	drawCenteredTexture(text: string, x: number, y: number, size: number, color: string) {
		if (this.context) {
			this.context.save();
			this.context.fillStyle = color;
			this.context.font = `${size}px RetroGaming`;
			this.context.textAlign = 'center';
			this.context.fillText(text, x, y);
		}
	}

	drawNet() {
		for (let i = 0; i <= canvasHeight / 2 - this.net.height; i += this.net.height) {
			this.net.y = i;
			this.drawRectangle(this.net.x, this.net.y, this.net.width, this.net.height, 'white');
			this.drawRectangle(
				this.net.x,
				canvasHeight - (this.net.height + this.net.y),
				this.net.width,
				this.net.height,
				'white'
			);
			i += 19;
		}
	}

	clear() {
		if (this.context) this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
	}

	drawScore(playerOne: IPlayer, playerTwo: IPlayer) {
		this.drawTexture(`${playerOne.goal}`, canvasWidth / 4, canvasHeight / 10, 45, 'white');
		this.drawTexture(`${playerTwo.goal}`, 3 * (canvasWidth / 4), canvasHeight / 10, 45, 'white');
	}

	drawStartCountDown(countDown: string) {
		this.drawCenteredTexture(`${countDown}`, this.screenWidth / 2, this.screenHeight / 2, 90, 'white');
	}

	drawWaiting() {
		this.drawCenteredTexture(`WAITING`, this.screenWidth / 2, this.screenHeight / 2, 90, 'white');
	}

	drawPausedState() {
		this.drawCenteredTexture(`PAUSED`, this.screenWidth / 2, this.screenHeight / 2, 90, 'white');
	}
}
