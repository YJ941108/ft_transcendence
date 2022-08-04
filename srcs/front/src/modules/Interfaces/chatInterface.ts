import IUserData from './userInterface';

export enum ChatState {
	ONLINE,
	OFFLINE,
	GAMING,
}

export interface IUserStatus {
	func: string;
	code: number;
	message: string;
	data: {
		userId: number;
		status: ChatState;
	};
}

export interface IChatUser {
	func: string;
	code: number;
	message: string;
	data: IUserData;
}

export interface IDMRoom {
	func: string;
	code: number;
	message: string;
	data: {
		id: number;
		createdAt: string;
		users: IUserData[];
		messages: string[];
	};
}

export interface IRoomStatus {
	func: string;
	code: number;
	message: string;
	data: IDMRoom;
}

export interface IDM {
	func: string;
	code: number;
	message: string;
	data: {
		content: string;
		DM: {
			id: number;
		};
		author: IUserData;
		id: number;
		createdAt: string;
	};
}
