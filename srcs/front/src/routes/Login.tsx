import React from 'react';
import styled from 'styled-components';
import LOGIN_API_URL from '../modules/constant';

const LoginC = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
const LoginButton = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 30rem;
	height: 3rem;
	background-color: gray;
	margin-bottom: 1rem;
`;

function Login() {
	return (
		<LoginC>
			<LoginButton>
				<a href={LOGIN_API_URL}>42Login</a>
			</LoginButton>
			<LoginButton>KakaoLogin</LoginButton>
			<LoginButton>GoogleLogin</LoginButton>
		</LoginC>
	);
}

export default Login;
