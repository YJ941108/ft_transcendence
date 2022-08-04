import IUser from './userInterface';

export enum ChatState {
	ONLINE,
	OFFLINE,
	GAMING,
}

export interface IUserStatus {
	func: () => void;
	code: number;
	message: string;
	data: {
		userId: number;
		status: ChatState;
	};
}

export interface IChatUser {
	func: () => void;
	code: number;
	message: string;
	data: {
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
		socketId: string;
		achievement: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface IDMRoom {
	func: () => void;
	code: number;
	message: string;
	data: {
		id: number;
		createdAt: string;
		users: IUser[];
		messages: string[];
	};
}

export interface IRoomStatus {
	func: () => void;
	code: number;
	message: string;
	data: IDMRoom;
}

export interface IDM {
	func: () => void;
	code: number;
	message: string;
	data: {
		content: string;
		DM: {
			id: number;
		};
		author: {
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
			socketId: null;
			achievement: number;
			createdAt: string;
			updatedAt: string;
		};
		id: number;
		createdAt: string;
	};
}
