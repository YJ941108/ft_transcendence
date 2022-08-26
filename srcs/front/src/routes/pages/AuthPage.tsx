import React, { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { onLogin } from '../../modules/login/login';
import { getUserData } from '../../modules/api';

function AuthPage() {
	const location = useLocation();
	const navigate = useNavigate();
	useEffect(() => {
		const setLogin = async () => {
			const token: string = location.search.split('=')[1];
			onLogin(token);
			const user = await getUserData();
			localStorage.setItem('user', JSON.stringify(user));
		};
		if (localStorage.getItem('token'))
			return () => {
				localStorage.clear();
				navigate('/');
			};
		setLogin();
		return () => {};
	}, [location.search]);
	return <Navigate to="/tfa" />;
}

export default AuthPage;
