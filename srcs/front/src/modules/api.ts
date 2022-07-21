import axios from 'axios';

interface IEmail {
	email: string;
}

const getUserData = async () => {
	const response = await axios.get('/api/users/me');
	return response.data;
};

export const postEmailData = async (email: IEmail) => {
	return axios.post('/api/auth/email', email);
};

export const getEmailData = async (email: IEmail) => {
	return axios.get(`/api/auth/${email.email}`);
};

export default getUserData;
