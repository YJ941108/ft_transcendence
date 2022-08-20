import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { channelInfoData, chatContent, MyInfo } from '../../../modules/atoms';
import { IChannel, IMyData, IMessageResponse, IMessages, IUserBanned } from '../../../modules/Interfaces/chatInterface';
import { getChannelInfo } from '../../../modules/api';

interface IFormInput {
	message: string;
}

interface ISendMessage {
	message: string;
	channelId: number;
	userId: number;
}

function OpenChatRoom({ chatSocket }: any) {
	const { register, handleSubmit, reset } = useForm<IFormInput>();
	const [messageList, setMessageList] = useState<IMessages[]>([]);
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const [channelInfo, setChannelInfo] = useRecoilState<IChannel>(channelInfoData);
	const [isOwner, setIsOwner] = useState(false);
	const {
		isLoading,
		data: basicChannelInfo,
		error,
	} = useQuery(['channel', channelInfo.id], () => getChannelInfo(channelInfo.id));
	const setChatContent = useSetRecoilState<string>(chatContent);

	const onSubmit = (data: IFormInput) => {
		const message: ISendMessage = {
			message: data.message,
			channelId: channelInfo.id,
			userId: myInfo.id,
		};
		chatSocket.emit('sendMessage', message);
		reset({
			message: '',
		});
	};

	const joinChat = () => {
		setChatContent('OpenChatInvite');
	};

	const editChat = () => {
		setChatContent('EditOpenChatRoom');
	};

	const userList = () => {
		setChatContent('OpenChatUsers');
	};

	const leaveChannel = () => {
		chatSocket.emit('leaveChannel', {
			channelId: channelInfo.id,
			userId: myInfo.id,
		});
		setChatContent('OpenChatList');
	};
	useEffect(() => {
		chatSocket.on('listeningMessage', (response: IMessageResponse) => {
			setMessageList((prevMessages) => {
				return [...prevMessages, response.data];
			});
		});
		chatSocket.on('listeningChannelDeleted', () => {
			alert('채팅방이 삭제되었습니다.');
			setChatContent('OpenChatList');
		});
		chatSocket.on('listeningChannelInfo', (response: { data: IChannel }) => {
			setChannelInfo(response.data);
		});
		chatSocket.on('listeningBan', (response: IUserBanned) => {
			if (myInfo.id === response.data.id) setChatContent('OpenChatList');
		});
		return () => {
			chatSocket.off('listeningChannelInfo');
			chatSocket.off('listeningChannelDeleted');
			chatSocket.off('listeningMessage');
			chatSocket.off('listeningBan');
		};
	}, [chatSocket]);
	useEffect(() => {
		chatSocket.emit('joinChannel', {
			channelId: channelInfo.id,
			userId: myInfo.id,
		});
	}, []);
	useEffect(() => {
		if (!isLoading && !error && basicChannelInfo) {
			const newMessages = basicChannelInfo?.data.messages;
			setMessageList((prevMessageList) => {
				return [...prevMessageList, ...newMessages];
			});
			if (myInfo.id === basicChannelInfo.data.owner.id) setIsOwner(true);
		}
		return () => {
			setMessageList([]);
		};
	}, [basicChannelInfo]);

	if (isLoading) return <h1>Loading</h1>;
	if (error) return <h1>Error</h1>;
	return (
		<div>
			<button type="button" onClick={joinChat}>
				joinChat
			</button>
			{isOwner ? (
				<button type="button" onClick={editChat}>
					editChat
				</button>
			) : null}
			<button type="button" onClick={userList}>
				users
			</button>
			<button type="button" onClick={leaveChannel}>
				leaveRoom
			</button>
			<ul>
				{messageList?.map((message: IMessages) => {
					if (myInfo?.blockedUsers.findIndex((e) => e.id === message.author?.id) !== -1)
						return <li key={message.id}>BLOCKED</li>;
					return <li key={message.id}>{message.content}</li>;
				})}
			</ul>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input {...register('message')} />
				<button type="submit">send</button>
			</form>
		</div>
	);
}

export default OpenChatRoom;
