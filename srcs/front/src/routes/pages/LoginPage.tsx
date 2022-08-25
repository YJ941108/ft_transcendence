import React from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';

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

interface IFormInput {
	email: string;
}

function LoginPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IFormInput>();
	const onSubmit: SubmitHandler<IFormInput> = (data) => {
		console.log(data);
	};
	return (
		<LoginC>
			<LoginButton>
				<a href={process.env.REACT_APP_FORTYTWO_LOGIN_API}>42Login</a>
			</LoginButton>
			<LoginButton>KakaoLogin</LoginButton>
			<LoginButton>GoogleLogin</LoginButton>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					{...register('email', {
						pattern: {
							value: /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
							message: '정확한 이메일 표기가 아닙니다. 다시 입력해주세요. ex)abc@gmail.com',
						},
					})}
				/>
				<span>{errors.email?.message}</span>
				<input type="submit" />
			</form>
		</LoginC>
	);
}

export default LoginPage;
