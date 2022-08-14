import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { onLogin } from '../../modules/login/login';
import { getUserData } from '../../modules/api';

function AuthPage() {
	const location = useLocation();
	useEffect(() => {
		const setLogin = async () => {
			const token: string = location.search.split('=')[1];
			onLogin(token);
			const user = await getUserData();
			localStorage.setItem('user', JSON.stringify(user));
		};
		setLogin();
	}, [location.search]);
	return <Navigate to="/game" />;
}

export default AuthPage;
