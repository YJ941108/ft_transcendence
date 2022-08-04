import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { chatContent } from '../../../modules/atoms';

enum OpenChatVisibility {
	private = 'private',
	public = 'public',
	protectedPassword = 'protectedPassword',
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

function NewOpenChatRoom() {
	const { register, handleSubmit } = useForm<IFormInput>();
	const [isPassword, setIsPassword] = useState(false);
	const setContent = useSetRecoilState(chatContent);
	const onSubmit = (data: IFormInput) => console.log(data);
	return (
		<NewOpenChatRoomC>
			<h1>Open Chat</h1>
			<button type="button" onClick={() => setContent('OpenChatList')}>
				exit
			</button>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input {...register('openChatName')} />
				<select {...register('openChatVisibility')}>
					<option value="private">private</option>
					<option value="public">public</option>
					<option value="protected-password" onClick={() => setIsPassword(!isPassword)}>
						protected-password
					</option>
				</select>
				{isPassword ? (
					<div>
						<h2>Password</h2>
						<input {...register('password')} />
					</div>
				) : null}
				<button type="submit">Create OpenChat</button>
			</form>
		</NewOpenChatRoomC>
	);
}

export default NewOpenChatRoom;
