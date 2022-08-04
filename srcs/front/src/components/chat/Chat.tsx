import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { io, Socket } from 'socket.io-client';
import { chatContent } from '../../modules/atoms';
import SearchInput from './SearchInput';
import { getUserData } from '../../modules/api';
import ChatNav from './ChatNav';
import UserList from './UserList';
import OpenChatList from './OpenChatList';
import FriendsList from './FriendsList';
import DirectMessageList from './DirectMessageList';
import IUser from '../../modules/Interfaces/userInterface';
import { IChatUser, IDM } from '../../modules/Interfaces/chatInterface';

// interface IDebug {
// 	func: string;
// 	code: number;
// 	message: string;
// }

// const getUsers = (chatSocket: Socket) => {
// 	chatSocket.emit('getUsers', (response: IDebug) => {
// 		console.log(response);
// 	});
// };

const ChatC = styled.div`
	width: 300px;
	height: 600px;
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
	const content = useRecoilValue(chatContent);
	const [socket, setSocket] = useState<any>(null);

	const selectComponent: ISelectComponent = {
		UserList: <UserList chatSocket={socket} />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList chatSocket={socket} />,
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
			console.log(user, '접속유저');
		});
		socket.on('chatError');
		socket.on('listeningDMRoom');
		socket.on('listeningDM', (directMessage: IDM) => {
			console.log(directMessage);
		});

		// return () => {
		// 	socket.off('listeningUser');
		// 	socket.off('chatError');
		// 	socket.off('listeningDMRoom');
		// 	socket.off('listeningDM');
		// };
	}, [socket, isLoading, error, userData]);

	useEffect(() => {
		if (isLoading || error || !userData) return;
		const socketIo: Socket = io('http://3.39.20.24:3032/api/chat');
		console.log('Chat 시작');
		console.log(userData, '내정보');
		setSocket(socketIo);
	}, [isLoading, error, setSocket]);

	return isLoading ? null : (
		<ChatC>
			<SearchInput />
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}

export default Chat;
