import axios from 'axios';

interface IEmail {
	email: string;
}

const getUserData = async () => {
	const response = await axios.get('/api/users/me');
	return response.data;
};

export const postEmailData = async (email: IEmail) => {
	const response = await axios.post('/api/auth/email', email);
	return response;
};

export const getEmailData = async (email: IEmail) => {
	return axios.get(`/api/auth/${email.email}`);
};

export const getUserListData = async () => {
	const response = await axios.get('/api/users/');
	return response.data;
};

export default getUserData;
