import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { chatContent, channelInfoData } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';
import { IChannel } from '../../../modules/Interfaces/chatInterface';

interface IFormInput {
	channelId: number;
	openChatName: string;
	openChatVisibility: 'private' | 'public' | 'protected';
	password?: string | number;
}

const EditOpenChatRoomC = styled.div`
	width: 100%;
	height: 100%;
`;

function EditOpenChatRoom() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IFormInput>();
	const chatSocket = useChatSocket();
	const [isPassword, setIsPassword] = useState(false);
	const setContent = useSetRecoilState(chatContent);
	const [channelData, setChannelData] = useRecoilState<IChannel>(channelInfoData);
	const onSubmit = (data: IFormInput) => {
		const editRoomData = {
			channelId: channelData.id,
			name: data.openChatName,
			privacy: data.openChatVisibility,
			password: data.password,
		};
		chatSocket.emit('updateChannel', editRoomData, (response: { data: IChannel }) => {
			setChannelData(response.data);
		});
		setContent('OpenChatRoom');
	};
	const openChatVisibilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (event.target.value === 'protected') setIsPassword(true);
		else setIsPassword(false);
	};
	const deleteChatRoom = () => {
		chatSocket.emit('deleteChannel', {
			channelId: channelData.id,
		});
		setContent('OpenChatList');
	};
	return (
		<EditOpenChatRoomC>
			<h1>Edit Open Chat</h1>
			<button type="button" onClick={() => setContent('OpenChatRoom')}>
				exit
			</button>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input type="text" placeholder="name..." maxLength={10} {...register('openChatName', { required: true })} />
				{errors.openChatName && errors.openChatName.type === 'required' && <span>This is required</span>}
				<select {...register('openChatVisibility')} onChange={openChatVisibilityChange}>
					<option value="public">public</option>
					<option value="private">private</option>
					<option value="protected">protected-password</option>
				</select>
				{isPassword ? (
					<div>
						<h2>Password</h2>
						<input type="text" placeholder="password..." maxLength={20} {...register('password', { required: true })} />
						{errors.password && errors.password.type === 'required' && <span>This is required</span>}
					</div>
				) : null}
				<button type="submit">Edit OpenChat</button>
			</form>
			<button type="button" onClick={deleteChatRoom}>
				DELETE
			</button>
		</EditOpenChatRoomC>
	);
}

export default EditOpenChatRoom;
