import { atom } from 'recoil';
import IUserData from './Interfaces/userInterface';

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
