import React from 'react';
import styled from 'styled-components';
import EmailSignUp from '../../components/login/EmailSignUp';
import EmailSignIn from '../../components/login/EmailSignIn';

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

function LoginPage() {
	return (
		<LoginC>
			<h2>로그인</h2>
			<LoginButton>
				<a href={process.env.REACT_APP_FORTYTWO_LOGIN_API}>42Login</a>
			</LoginButton>
			<LoginButton>KakaoLogin</LoginButton>
			<LoginButton>GoogleLogin</LoginButton>
			<EmailSignIn />
			<h2>회원가입</h2>
			<EmailSignUp />
		</LoginC>
	);
}

export default LoginPage;
