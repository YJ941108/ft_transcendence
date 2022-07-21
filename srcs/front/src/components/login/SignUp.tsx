import React from 'react';
import { useMutation } from 'react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { postEmailData } from '../../modules/api';
import IEmail from './EmailInterface';

function SignUp() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IEmail>();
	const { mutate } = useMutation(postEmailData);
	const onSubmit: SubmitHandler<IEmail> = (email) => {
		mutate(email);
	};
	return (
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

export default SignUp;
