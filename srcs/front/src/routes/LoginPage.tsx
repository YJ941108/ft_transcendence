import React from 'react';
import styled from 'styled-components';

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
			<LoginButton>
				<a href={process.env.REACT_APP_FORTYTWO_LOGIN_API}>42Login</a>
			</LoginButton>
			<LoginButton>KakaoLogin</LoginButton>
			<LoginButton>GoogleLogin</LoginButton>
		</LoginC>
	);
}

export default LoginPage;
