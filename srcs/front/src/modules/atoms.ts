import { atom } from 'recoil';

export const chatSocketState = atom({
	key: 'chatSocket',
	default: null,
});

export const chatContentC = atom({
	key: 'chatContentC',
	default: 'UserList',
});

export const chatUserList = atom({
	key: 'chatUserList',
	default: [],
});
