import React from 'react';
import { useQuery } from 'react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getEmailData } from '../../modules/api';
import IEmail from './EmailInterface';

function SignIn() {
	const {
		register,
		handleSubmit,
		formState: { error },
	} = useForm<IEmail>();
	const onSubmit: SubmitHandle<IEmail> = async (email) => {
		const response = await axios.get(`/api/auth/${email.email}`);
	};
	return <form onSubmit={handleSubmit(onSubmit)}></form>;
}

export default SignIn;
