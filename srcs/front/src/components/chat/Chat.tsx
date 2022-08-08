import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useRecoilValue, useRecoilState } from 'recoil';
import { io, Socket } from 'socket.io-client';
import {
	MyInfo,
	chatContent,
	chatUserList,
	DMRoomList,
	friendsList,
	requestList,
	// DMRoomInfo,
} from '../../modules/atoms';
// import SearchInput from './SearchInput';
import { getUserData } from '../../modules/api';
import ChatNav from './ChatNav';
import DMRoom from './DMRoom';
import UserList from './UserList';
import OpenChatList from './OpenChatList';
import FriendsList from './FriendsList';
import DirectMessageList from './DirectMessageList';
import IUserData from '../../modules/Interfaces/userInterface';
import { IMyData, IMyDataResponse, IErr } from '../../modules/Interfaces/chatInterface';
import { emitJoinChat } from './Emit';

const ChatC = styled.div`
	width: 300px;
	height: 100%;
	position: absolute;
	top: 3rem;
	border: solid white 2px;
`;
interface ISelectComponent {
	[index: string]: React.ReactNode;
	UserList: React.ReactNode;
	OpenChatList: React.ReactNode;
	FriendsList: React.ReactNode;
	DirectMessageList: React.ReactNode;
	DMRoom: React.ReactNode;
}
function Chat() {
	const { isLoading, data: userData, error } = useQuery<IMyData>('user', getUserData);
	const content = useRecoilValue(chatContent);
	const [socket, setSocket] = useState<any>(null);
	const [, setMyInfo] = useRecoilState<IMyData>(MyInfo);
	const [, setRooms] = useRecoilState<IUserData[]>(DMRoomList);
	// const [, setRoomInfo] = useRecoilState<IDMRoomInfo>(DMRoomInfo);
	const [, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const [, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [, setFriendsUsers] = useRecoilState<IUserData[]>(friendsList);

	const selectComponent: ISelectComponent = {
		UserList: <UserList chatSocket={socket} />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList chatSocket={socket} />,
		DirectMessageList: <DirectMessageList chatSocket={socket} />,
		DMRoom: <DMRoom chatSocket={socket} />,
	};

	useEffect(() => {
		if (!socket || isLoading || error || !userData) return () => {};
		if (socket.connected === false) {
			socket.on('connect', () => {
				emitJoinChat(socket, userData.id, userData.nickname);
			});
		}
		socket.on('listeningMe', (response: IMyDataResponse) => {
			setMyInfo(response.data);
			setRequestUsers(response.data.friendsRequest);
			setFriendsUsers(response.data.friends);
		});
		socket.on('listeningGetUsers', (response: { data: IUserData[] }) => {
			setUsers(response.data);
		});

		// socket.on('listeningDMRoomInfo', (response: IDMRoomInfo) => {
		// 	console.log(response, 'listeningDMRoomInfo');
		// 	setRoomInfo(response);
		// });

		socket.on('listeningDMRoomList', (response: { data: IUserData[] }) => {
			console.log(response, 'listeningDMRoomList');
			setRooms(response.data);
		});
		socket.on('chatError', (response: IErr) => {
			alert(response.message);
		});
		return () => {
			socket.off('connect');
			socket.off('listeningMe');
			socket.off('listeningGetUsers');
			socket.off('listeningDMRoomInfo');
			socket.off('listeningDMRoomList');
			socket.off('chatError');
		};
	}, [socket, isLoading, error, userData]);

	useEffect(() => {
		if (isLoading || error || !userData) return;
		const socketIo: Socket = io('http://3.39.20.24:3032/api/chat');
		setSocket(socketIo);
	}, [isLoading, error, setSocket]);

	return isLoading ? null : (
		<ChatC>
			{/* <SearchInput /> */}
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}

export default Chat;
