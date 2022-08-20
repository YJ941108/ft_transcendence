import axios from 'axios';

export const onLogin = (token: string) => {
	localStorage.setItem('token', token);
	axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const refreshToken = () => {
	const token = localStorage.getItem('token');
	axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const deleteToken = () => {
	const token = localStorage.clear();
	axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};
