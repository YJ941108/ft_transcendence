import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Navigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { postEmailData } from '../../modules/api';
import IEmail from './EmailInterface';

function EmailSignUp() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IEmail>();
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState('');
	const { mutate } = useMutation(postEmailData, {
		onSuccess: ({ data: tokenData }) => {
			setToken(tokenData);
		},
		onError: () => {
			console.log('전송 실패');
		},
	});
	const onSubmit: SubmitHandler<IEmail> = (email) => {
		setIsLoading(true);
		mutate(email);
		setIsLoading(false);
	};
	if (isLoading) return <h1>Loading...</h1>;
	return token ? (
		<Navigate to={`/auth?token=${token}`} />
	) : (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input
				placeholder="email을 입력해주세요."
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
	);
}

export default EmailSignUp;
