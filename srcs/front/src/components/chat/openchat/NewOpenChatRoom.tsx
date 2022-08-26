import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { channelInfoData, chatContent, MyInfo, channelIdData } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';
import { IMyData, IChannel } from '../../../modules/Interfaces/chatInterface';

const RoomTypeSelectStyleC = styled.select`
	width: 100%;
`;

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
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IFormInput>();
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
		console.log('createChannel', newChannelData);
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
				<input type="text" placeholder="ROOM TITLE" maxLength={10} {...register('openChatName', { required: true })} />
				{errors.openChatName && errors.openChatName.type === 'required' && <span>This is required</span>}
				<RoomTypeSelectStyleC {...register('openChatVisibility')} onChange={openChatVisibilityChange}>
					<option value="public">PUBLIC</option>
					<option value="private">PRIVATE</option>
					<option value="protected">PASSWORD</option>
				</RoomTypeSelectStyleC>
				{isPassword ? (
					<div>
						<h2>Password</h2>
						<input type="text" placeholder="PASSWORD" maxLength={20} {...register('password', { required: true })} />
					</div>
				) : null}
				<button type="submit">Create OpenChat</button>
			</form>
		</NewOpenChatRoomC>
	);
}

export default NewOpenChatRoom;
