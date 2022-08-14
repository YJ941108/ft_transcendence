import { atom } from 'recoil';
import IUserData from './Interfaces/userInterface';
import { IMyData, IDMRoom, IChannel } from './Interfaces/chatInterface';

export const chatSocketState = atom({
	key: 'chatSocket',
	default: null,
});

export const chatContent = atom({
	key: 'chatContent',
	default: 'UserList',
});

export const chatUserList = atom<IUserData[]>({
	key: 'chatUserList',
	default: [],
});

export const friendsList = atom<IUserData[]>({
	key: 'friendsList',
	default: [],
});

export const requestList = atom<IUserData[]>({
	key: 'requestList',
	default: [],
});

export const MyInfo = atom<IMyData>({
	key: 'myInfo',
	default: {
		id: 0,
		username: '',
		email: '',
		nickname: '',
		photo: '',
		tfa: false,
		tfaCode: false,
		isFriend: false,
		isOnline: false,
		wins: 0,
		losses: 0,
		ratio: 0,
		achievement: 0,
		createdAt: '',
		updatedAt: '',
		friendsRequest: [],
		friends: [],
	},
});

export const DMRoomInfo = atom<IDMRoom>({
	key: 'dmRoomInfo',
	default: {
		id: 0,
		createAt: '',
		me: {
			id: 0,
			username: '',
			email: '',
			nickname: '',
			photo: '',
			tfa: false,
			tfaCode: false,
			wins: 0,
			losses: 0,
			ratio: 0,
			isFriend: false,
			isOnline: false,
			achievement: 0,
			createdAt: '',
			updatedAt: '',
		},
		another: {
			id: 0,
			username: '',
			email: '',
			nickname: '',
			photo: '',
			tfa: false,
			tfaCode: false,
			wins: 0,
			losses: 0,
			ratio: 0,
			isFriend: false,
			isOnline: false,
			achievement: 0,
			createdAt: '',
			updatedAt: '',
		},
		message: [],
	},
});

export const channelIdData = atom<number>({
	key: 'channelIdData',
	default: 0,
});

export const DMRoomList = atom<IDMRoom[]>({
	key: 'dmRoomList',
	default: [],
});

export const channelListInfo = atom<IChannel[]>({
	key: 'channelListInfo',
	default: [],
});

export const channelInfoData = atom<IChannel>({
	key: 'channelInfoData',
	default: {
		id: 0,
		name: '',
		privacy: '',
		restrictionDuration: 0,
		createdAt: '',
		owner: {
			id: 0,
			username: '',
			email: '',
			nickname: '',
			photo: '',
			tfa: false,
			tfaCode: false,
			wins: 0,
			losses: 0,
			ratio: 0,
			isFriend: false,
			isOnline: false,
			achievement: 0,
			createdAt: '',
			updatedAt: '',
		},
		users: [],
		admins: [],
		messages: [],
	},
});
