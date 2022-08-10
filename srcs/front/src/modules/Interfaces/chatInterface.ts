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
	data: IUserData[];
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

export interface IFriendsList {
	func: string;
	code: number;
	message: string;
	data: {
		friendsRequest: IUserData[];
		friends: IUserData[];
	};
}

export interface IMyData {
	id: number;
	username: string;
	email: string;
	nickname: string;
	photo: string;
	tfa: boolean;
	tfaCode: boolean;
	isFriend: boolean;
	isOnline: boolean;
	wins: number;
	losses: number;
	ratio: number;
	achievement: number;
	createdAt: string;
	updatedAt: string;
	friendsRequest: IUserData[];
	friends: IUserData[];
}

export interface IMyDataResponse {
	func: string;
	code: number;
	message: string;
	data: IMyData;
}

export interface IErr {
	code: number;
	data?: any;
	message: string;
}

export interface IMessages {
	id: number;
	content: string;
	createdAt: string;
	author: IUserData;
}

export interface IDMlisten {
	func: string;
	code: number;
	message: string;
	data: {
		message: string;
		author: IUserData;
		DMId: number;
	};
}

export interface IDMRoom {
	id: number;
	createAt: string;
	me: IUserData;
	another: IUserData;
	message: IMessages[];
}

export interface IDMRoomList {
	func: string;
	code: number;
	message: string;
	data: IDMRoom[];
}
