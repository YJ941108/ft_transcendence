import { canvasWidth, canvasHeight, IBall, IPlayer, IRoom } from './GameInterfaces';

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
			this.context.font = '48px serif';
			this.context.fillText(text, x, y);
			this.context.restore();
		}
	}

	clear() {
		if (this.context) this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
	}

	drawScore(playerOne: IPlayer, playerTwo: IPlayer) {
		this.drawTexture(`${playerOne.goal}`, canvasWidth / 4, canvasHeight / 10, 200, 'white');
		this.drawTexture(`${playerTwo.goal}`, 3 * (canvasWidth / 4), canvasHeight / 10, 45, 'white');
	}
}
