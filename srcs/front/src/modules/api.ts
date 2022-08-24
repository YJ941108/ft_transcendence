import axios from 'axios';
import { refreshToken } from './login/login';

interface IEmail {
	email: string;
}

refreshToken();

export const getUserData = async () => {
	const { data: me } = await axios.get('/api/users/me');
	return me;
};

export const getUsersData = async () => {
	const { data: user } = await axios.get('/api/users');
	return user;
};

export const getAnotherUserData = async (nickname: string | undefined) => {
	const { data: anotherUser } = await axios.get(`api/users/another/${nickname}`);
	return anotherUser;
};

export const postEmailData = async (email: IEmail) => {
	const { data: postEmail } = await axios.post('/api/auth/email', email);
	return postEmail;
};

export const addFriend = async (nickname: string) => {
	const { data: addFriendData } = await axios.get(`/api/users/${nickname}/request`);
	return addFriendData;
};

export const acceptFriend = async (nickname: string) => {
	const { data: acceptFriendData } = await axios.get(`/api/users/${nickname}/accept`);
	return acceptFriendData;
};
export const denyFriend = async (nickname: string) => {
	const { data: denyFriendData } = await axios.get(`/api/users/${nickname}/deny`);
	return denyFriendData;
};

export const deleteFriend = async (nickname: string) => {
	const { data: deleteFriendData } = await axios.get(`/api/users/${nickname}/delete`);
	return deleteFriendData;
};
export const blockUser = async (nickname: string) => {
	const { data: blockUserData } = await axios.get(`/api/users/${nickname}/block`);
	return blockUserData;
};

export const releaseUser = async (nickname: string) => {
	const { data: releaseUserData } = await axios.get(`/api/users/${nickname}/release`);
	return releaseUserData;
};

export const getEmailData = async (email: IEmail) => {
	return axios.get(`/api/auth/${email.email}`);
};

export const getUserListData = async () => {
	const { data: userList } = await axios.get('/api/users/');
	return userList;
};

// export const postUserData = async (inputValue: string) => {
// 	const response = await axios.post('/api/users/me', { nickname: inputValue });
// 	return response.data;
// };

export const getChannelInfo = async (channelId: number) => {
	const { data: channelInfo } = await axios.get(`/api/chat/channel/${channelId}`);
	return channelInfo;
};

export const getGameMatchHistory = async (id: number) => {
	const { data: gameMatchHistory } = await axios.get(`/api/games/${id}`);
	return gameMatchHistory;
};
