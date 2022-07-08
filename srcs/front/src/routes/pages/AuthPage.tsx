import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { onLogin } from '../../modules/login/login';

function AuthPage() {
	const location = useLocation();
	useEffect(() => {
		const token: string = location.search.split('=')[1];
		onLogin(token);
	}, [location.search]);

	return (
		<div>
			<Navigate to="/" />
		</div>
	);
}

export default AuthPage;
