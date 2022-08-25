import React, { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { channelInfoData, chatContent, MyInfo } from '../../../modules/atoms';
import {
	IChannel,
	IMyData,
	IChannelMessageResponse,
	IChannelMessage,
	IUserBanned,
} from '../../../modules/Interfaces/chatInterface';
import { getChannelInfo } from '../../../modules/api';
import { useChatSocket } from '../SocketContext';
import OpenChatMessage from './OpenChatMessage';
import OpenChatNoti from './OpenChatNoti';

const SendDivStyleC = styled.div`
	width: 100%;
	height: 80px;
	display: flex;
	border: none;
	margin: 0;
`;

const InputStyleC = styled.textarea`
	width: 80%;
	height: 100%;
	resize: none;
	background-color: black;
	color: white;
	border: none;
	&:hover {
		border: 1px solid rgba(0, 0, 0, 0.3);
	}
	&:focus {
		outline: none;
		/* outline: 1px solid rgba(0, 0, 0, 0.5); */
		border: 1px solid rgba(0, 0, 0, 0.3);
	}
`;

const SendButtonStyleC = styled.button`
	background-color: black;
	color: white;
	/* height: 100%; */
	width: 20%;
	font-size: 0.8rem;
	border: 1px solid white;
	margin: 10px;
	/* border: none; */
`;

const ChatLogStyleC = styled.ul`
	min-height: 720px;
	max-height: 720px;
	border-bottom: solid white 2px;
	height: 100%;
	overflow-wrap: break-word;
	overflow-y: scroll;
`;

interface IFormInput {
	message: string;
}

interface ISendMessage {
	message: string;
	channelId: number;
	userId: number;
}

function OpenChatRoom() {
	const chatSocket = useChatSocket();
	const { register, handleSubmit, reset } = useForm<IFormInput>();
	const [messageList, setMessageList] = useState<IChannelMessage[]>([]);
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const [channelInfo, setChannelInfo] = useRecoilState<IChannel>(channelInfoData);
	const [isOwner, setIsOwner] = useState(false);
	const messageBoxRef = useRef<HTMLUListElement>(null);
	const {
		isLoading,
		data: basicChannelInfo,
		error,
	} = useQuery(['channel', channelInfo.id], () => getChannelInfo(channelInfo.id));
	const setChatContent = useSetRecoilState<string>(chatContent);

	const onSubmit: SubmitHandler<IFormInput> = (data: IFormInput) => {
		const message: ISendMessage = {
			message: data.message,
			channelId: channelInfo.id,
			userId: myInfo.id,
		};
		if (data.message !== '') chatSocket.emit('sendMessage', message);

		const timer = setTimeout(() => {
			reset({
				message: '',
			});
			clearTimeout(timer);
		}, 0);
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

	const scrollToBottom = (e: Event) => {
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLUListElement;

		target.scroll({
			top: target.scrollHeight,
			// behavior: 'smooth',
		});
	};

	const onEnterPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			const data: IFormInput = { message: event.currentTarget.value };
			if (event.currentTarget.value) {
				return handleSubmit(onSubmit(data));
			}
		}
		return null;
	};

	const leaveChannel = () => {
		chatSocket.emit('leaveChannel', {
			channelId: channelInfo.id,
			userId: myInfo.id,
		});
		setChatContent('OpenChatList');
	};

	useEffect(() => {
		chatSocket.on('listeningMessage', (response: IChannelMessageResponse) => {
			if (channelInfo.id === response.data.channelId) {
				setMessageList((prevMessages) => {
					return [...prevMessages, response.data];
				});
			}
		});
		chatSocket.on('listeningChannelDeleted', () => {
			alert('채팅방이 삭제되었습니다.');
			setChatContent('OpenChatList');
		});
		chatSocket.on('listeningChannelInfo', (response: { data: IChannel }) => {
			if (response.data.id === channelInfo.id) setChannelInfo(response.data);
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
		if (messageBoxRef.current) {
			messageBoxRef.current.addEventListener('DOMNodeInserted', scrollToBottom);
		}

		return () => {
			if (messageBoxRef.current) {
				messageBoxRef.current.removeEventListener('DOMNodeInserted', scrollToBottom);
			}
		};
	}, [messageList]);

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
			<ChatLogStyleC ref={messageBoxRef}>
				{messageList?.map((message: IChannelMessage) => {
					if (!message.author) return <OpenChatNoti key={message.id} content={message.content} />;
					if (myInfo?.blockedUsers.findIndex((e) => e.id === message.author?.id) !== -1) return null;
					return <OpenChatMessage key={message.id} author={message.author} content={message.content} />;
				})}
			</ChatLogStyleC>
			<form onSubmit={handleSubmit(onSubmit)}>
				<SendDivStyleC>
					<InputStyleC placeholder="메시지를 입력하세요." onKeyPress={onEnterPress} {...register('message')} />
					<SendButtonStyleC type="submit">SEND</SendButtonStyleC>
				</SendDivStyleC>
			</form>
			{isOwner ? (
				<button type="button" onClick={joinChat}>
					INVITE
				</button>
			) : null}
			{isOwner ? (
				<button type="button" onClick={editChat}>
					EDIT
				</button>
			) : null}
			<button type="button" onClick={userList}>
				USERS
			</button>
			{!isOwner ? (
				<button type="button" onClick={leaveChannel}>
					LEAVE
				</button>
			) : null}
		</div>
	);
}

export default OpenChatRoom;
