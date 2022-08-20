import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { IMyData, IChannel, IChannelResponse } from '../../../modules/Interfaces/chatInterface';
import { channelInfoData, chatContent, MyInfo } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';

interface IFormInput {
	password: string | number;
}

function ProtectedPassword() {
	const chatSocket = useChatSocket();
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const [channelInfo, setChannelInfo] = useRecoilState<IChannel>(channelInfoData);
	const setContent = useSetRecoilState(chatContent);
	const { register, handleSubmit } = useForm<IFormInput>();
	const onSubmit = (data: IFormInput) => {
		const passwordData = {
			channelId: channelInfo.id,
			userId: myInfo.id,
			password: data.password,
		};
		chatSocket.emit('joinProtected', passwordData);
	};
	useEffect(() => {
		chatSocket.on('listeningChannelInfo', (response: IChannelResponse) => {
			setChannelInfo(response.data);
			if (response.code === 200) setContent('OpenChatRoom');
		});
		return () => {
			chatSocket.off('listeningChannelInfo');
		};
	}, [chatSocket]);

	return (
		<div>
			<h1>Protected Password</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<h2>Press Password</h2>
				<input {...register('password', { required: true, maxLength: 20 })} />
				<button type="submit">Enter</button>
			</form>
		</div>
	);
}

export default ProtectedPassword;
