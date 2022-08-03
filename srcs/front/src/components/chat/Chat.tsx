import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { io, Socket } from 'socket.io-client';
import { chatContentC } from '../../modules/atoms';
import SearchInput from './SearchInput';
import { getUserData } from '../../modules/api';
import ChatNav from './ChatNav';
import UserList from './UserList';
import OpenChatList from './OpenChatList';
import FriendsList from './FriendsList';
import DirectMessageList from './DirectMessageList';
import IUser from '../../modules/Interfaces/userInterface';
import { IChatUser, IDM } from '../../modules/Interfaces/chatInterface';

const ChatC = styled.div`
	width: 300px;
	height: 100%;
	top: 3.5rem;
`;

interface ISelectComponent {
	[index: string]: React.ReactNode;
	UserList: React.ReactNode;
	OpenChatList: React.ReactNode;
	FriendsList: React.ReactNode;
	DirectMessageList: React.ReactNode;
}

function Chat() {
	const { isLoading, data: userData, error } = useQuery<IUser>('user', getUserData);
	const content = useRecoilValue(chatContentC);
	const [socket, setSocket] = useState<any>(null);

	const socketIo: Socket = io('http://3.39.20.24:3032/api/chat');

	const selectComponent: ISelectComponent = {
		UserList: <UserList chatSocket={socket} />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList />,
		DirectMessageList: <DirectMessageList />,
	};

	useEffect(() => {
		if (!socket || isLoading || error || !userData) return;
		if (socket.connected === false) {
			socket.on('connect', () => {
				socket.emit('joinChat', { id: userData.id, nickname: userData.nickname });
			});
		}
		socket.on('listeningUser', (user: IChatUser) => {
			console.log(user);
		});
		socket.on('chatError');
		socket.on('listeningDMRoom');
		socket.on('listeningDM', (directMessage: IDM) => {
			console.log(directMessage);
		});
	}, [socket, isLoading, error, userData]);

	useEffect(() => {
		if (isLoading || error || !userData) return;

		setSocket(socketIo);
	}, [isLoading, error, userData, setSocket]);

	return isLoading ? null : (
		<ChatC>
			<SearchInput />
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}
export default Chat;
