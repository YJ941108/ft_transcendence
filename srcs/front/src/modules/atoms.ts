import { atom } from 'recoil';
import IUser from './Interfaces/userInterface';

export const chatSocketState = atom({
	key: 'chatSocket',
	default: null,
});

export const chatContentC = atom({
	key: 'chatContentC',
	default: 'UserList',
});

export const chatUserList = atom<IUser[]>({
	key: 'chatUserList',
	default: [],
});
