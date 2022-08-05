import { Socket } from 'socket.io-client';

export default interface IUserData {
	id: number;
	username: string;
	email: string;
	nickname: string;
	photo: string;
	tfa: boolean;
	tfaCode: boolean;
	wins: number;
	losses: number;
	ratio: number;
	isOnline: boolean;
	achievement: number;
	createdAt: string;
	updatedAt: string;
}

export interface IUserList {
	nickname: string;
	photo: string;
	chatSocket: Socket;
	isOnline: boolean;
}
