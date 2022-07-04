import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import userData from '../modules/userData';
import { getCookieAll } from '../modules/cookie';

function AuthPage() {
	const setUser = useSetRecoilState(userData);

	useEffect(() => {
		setUser(getCookieAll());
	});

	return <div>Hello</div>;
}

export default AuthPage;
