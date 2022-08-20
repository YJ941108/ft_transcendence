import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { channelInfoData, chatContent, MyInfo, channelIdData } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';
import { IMyData, IChannel } from '../../../modules/Interfaces/chatInterface';

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
	const chatSocket = useChatSocket();
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const { register, handleSubmit } = useForm<IFormInput>();
	const [isPassword, setIsPassword] = useState(false);
	const setContent = useSetRecoilState(chatContent);
	const setChannelInfo = useSetRecoilState(channelInfoData);
	const setChannelId = useSetRecoilState(channelIdData);
	const onSubmit = (data: IFormInput) => {
		const newChannelData = {
			name: data.openChatName,
			privacy: data.openChatVisibility,
			password: data.password,
			userId: myInfo.id,
		};
		chatSocket.emit('createChannel', newChannelData, (response: { data: IChannel }) => {
			setChannelId(response.data.id);
			setChannelInfo(response.data);
			setContent('OpenChatRoom');
		});
	};
	const openChatVisibilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (event.target.value === 'protected') setIsPassword(true);
		else setIsPassword(false);
	};
	return (
		<NewOpenChatRoomC>
			<h1>Open Chat</h1>
			<button type="button" onClick={() => setContent('OpenChatList')}>
				exit
			</button>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input {...register('openChatName')} />
				<select {...register('openChatVisibility')} onChange={openChatVisibilityChange}>
					<option value="private">private</option>
					<option value="public">public</option>
					<option value="protected">protected-password</option>
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
