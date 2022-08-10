import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { chatContent } from '../../../modules/atoms';
import { IMyData } from '../../../modules/Interfaces/chatInterface';
import { getUserData } from '../../../modules/api';

enum OpenChatVisibility {
	private = 'private',
	public = 'public',
	protectedPassword = 'protectedPassword',
}

interface INewOpenChatRoomProps {
	chatSocket: any;
}

interface IFormInput {
	openChatName: string;
	openChatVisibility: OpenChatVisibility;
	password?: string | number;
}

const NewOpenChatRoomC = styled.div`
	width: 100%;
	height: 100%;
`;

function NewOpenChatRoom({ chatSocket }: INewOpenChatRoomProps) {
	const { isLoading, data: userData } = useQuery<IMyData>('user', getUserData);
	const { register, handleSubmit } = useForm<IFormInput>();
	const [isPassword, setIsPassword] = useState(false);
	const setContent = useSetRecoilState(chatContent);
	const onSubmit = (data: IFormInput) => {
		const newRoomData = {
			name: data.openChatName,
			privacy: data.openChatVisibility,
			password: data.password,
			userId: userData?.id,
		};
		chatSocket.emit('createChannel', newRoomData);
	};
	const openChatVisibilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (event.target.value === 'protected-password') setIsPassword(true);
		else setIsPassword(false);
	};
	return (
		<NewOpenChatRoomC>
			<h1>Open Chat</h1>
			<button type="button" onClick={() => setContent('OpenChatList')}>
				exit
			</button>
			{isLoading ? null : (
				<form onSubmit={handleSubmit(onSubmit)}>
					<input {...register('openChatName')} />
					<select {...register('openChatVisibility')} onChange={openChatVisibilityChange}>
						<option value="private">private</option>
						<option value="public">public</option>
						<option value="protected-password">protected-password</option>
					</select>
					{isPassword ? (
						<div>
							<h2>Password</h2>
							<input {...register('password')} />
						</div>
					) : null}
					<button type="submit">Create OpenChat</button>
				</form>
			)}
		</NewOpenChatRoomC>
	);
}

export default NewOpenChatRoom;
