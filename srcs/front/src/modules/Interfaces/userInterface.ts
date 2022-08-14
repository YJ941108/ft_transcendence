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
	isFriend: boolean;
	isOnline: boolean;
	achievement: number;
	createdAt: string;
	updatedAt: string;
}

export interface IUserList {
	id: number;
	nickname: string;
	photo: string;
	chatSocket: Socket;
	isOnline: boolean;
}
