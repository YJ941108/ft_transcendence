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

export interface IMessages {
	id: number;
	content: string;
	createdAt: string;
	author: IUserData;
}

export interface IMessageResponse {
	func: string;
	code: number;
	message: string;
	data: IMessages;
}

export interface IDMRoomInfo {
	func: string;
	code: number;
	message: string;
	data: {
		id: number;
		createdAt: string;
		users: IUserData[];
		messages: IMessages[];
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

export interface IChannel {
	id: number;
	name: string;
	privacy: string;
	restrictionDuration: number;
	createdAt: string;
	owner: IUserData;
	users: IUserData[];
	admins: IUserData[];
	messages: IMessages[];
}

export interface IChannelResponse {
	func: string;
	code: number;
	message: string;
	data: IChannel;
}
