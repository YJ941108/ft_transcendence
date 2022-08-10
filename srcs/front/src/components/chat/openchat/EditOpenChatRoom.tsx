import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { chatContent, channelInfoData } from '../../../modules/atoms';
import { IChannel } from '../../../modules/Interfaces/chatInterface';

interface IEditOpenChatRoomProps {
	chatSocket: any;
}

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

function EditOpenChatRoom({ chatSocket }: IEditOpenChatRoomProps) {
	const { register, handleSubmit } = useForm<IFormInput>();
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
				<button type="submit">Edit OpenChat</button>
			</form>
			<button type="button" onClick={deleteChatRoom}>
				DELETE
			</button>
		</EditOpenChatRoomC>
	);
}

export default EditOpenChatRoom;
