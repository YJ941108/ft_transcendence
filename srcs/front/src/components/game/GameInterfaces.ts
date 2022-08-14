export const canvasWidth = 1920;
export const canvasHeight = 1080;

export enum GameState {
	WAITING,
	STARTING,
	PLAYING,
	PAUSED,
	RESUMED,
	PLAYER_ONE_SCORED,
	PLAYER_TWO_SCORED,
	PLAYER_ONE_WIN,
	PLAYER_TWO_WIN,
}

export interface IKey {
	roomId: string;
	key: string;
	nickname: string;
}

export interface IUser {
	id: number;
	nickname: string;
}

export interface IPlayer {
	user: IUser;
	x: number;
	y: number;
	width: number;
	height: number;
	goal: number;
	color: string;
}

export interface IBall {
	x: number;
	y: number;
	r: number;
	color: string;
}

export interface IRoom {
	roomId: string;
	gameState: GameState;
	paddleOne: IPlayer;
	paddleTwo: IPlayer;
	ball: IBall;
	timestampStart: number;
	goalTimestamp: number;
	pauseTime: { pause: number; resume: number }[];
	winner: string;
	loser: string;
	mode: string;
	timer: number;
	gameDuration: number;
}
