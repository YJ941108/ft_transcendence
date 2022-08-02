import axios from 'axios';

interface IEmail {
	email: string;
}

export const getUserData = async () => {
	const response = await axios.get('/api/users/me');
	return response.data;
};

export const getUsersData = async () => {
	const response = await axios.get('/api/users');
	return response.data;
};

export const postEmailData = async (email: IEmail) => {
	const response = await axios.post('/api/auth/email', email);
	return response;
};

export const addFriend = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/request`);
	return response;
};

export const acceptFriend = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/accept`);
	return response;
};
export const denyFriend = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/deny`);
	return response;
};

export const deleteFriend = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/delete`);
	return response;
};
export const blockUser = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/block`);
	return response;
};

export const releaseUser = async (nickname: string) => {
	const response = await axios.get(`/api/users/${nickname}/release`);
	return response;
};

export const getEmailData = async (email: IEmail) => {
	return axios.get(`/api/auth/${email.email}`);
};

export const getFriendsListData = async () => {
	const response = await axios.get('/api/users');
	return response.data;
};
