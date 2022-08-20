import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useChatSocket } from './SocketContext';
import {
	MyInfo,
	chatContent,
	chatUserList,
	DMRoomList,
	friendsList,
	requestList,
	channelListInfo,
	blockedList,
} from '../../modules/atoms';
// import SearchInput from './SearchInput';

import { getUserData } from '../../modules/api';
import ChatNav from './ChatNav';
import DMRoom from './DMRoom';
import UserList from './UserList';
import OpenChatList from './openchat/OpenChatList';
import FriendsList from './FriendsList';
import NewOpenChatRoom from './openchat/NewOpenChatRoom';
import OpenChatRoom from './openchat/OpenChatRoom';
import DirectMessageList from './DirectMessageList';
import IUserData from '../../modules/Interfaces/userInterface';
import { IMyData, IMyDataResponse, IErr, IDMRoom, IChannel } from '../../modules/Interfaces/chatInterface';
import { emitJoinChat } from './Emit';
import OpenChatInvite from './openchat/OpenChatInvite';
import EditOpenChatRoom from './openchat/EditOpenChatRoom';
import ProtectedPassword from './openchat/ProtectedPassword';
import OpenChatUsers from './openchat/OpenChatUsers';

const ChatC = styled.div`
	width: 300px;
	/* height: 100%;
	position: absolute; */
	border: solid white 2px;
`;
interface ISelectComponent {
	[index: string]: React.ReactNode;
	NewOpenChatRoom: React.ReactNode;
	UserList: React.ReactNode;
	OpenChatList: React.ReactNode;
	FriendsList: React.ReactNode;
	DirectMessageList: React.ReactNode;
	DMRoom: React.ReactNode;
	OpenChatRoom: React.ReactNode;
	OpenChatInvite: React.ReactNode;
	EditOpenChatRoom: React.ReactNode;
	ProtectedPassword: React.ReactNode;
	OpenChatUsers: React.ReactNode;
}
function Chat() {
	const { isLoading, data: userData, error } = useQuery<IMyData>('user', getUserData);
	const content = useRecoilValue(chatContent);
	const socket = useChatSocket();
	// console.log(socket.connected);
	const [, setMyInfo] = useRecoilState<IMyData>(MyInfo);
	const [, setRooms] = useRecoilState<IDMRoom[]>(DMRoomList);
	const [, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const [, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [, setFriendsUsers] = useRecoilState<IUserData[]>(friendsList);
	const [, setBlockedUsers] = useRecoilState<IUserData[]>(blockedList);
	const [, setChannelList] = useRecoilState<IChannel[]>(channelListInfo);

	const selectComponent: ISelectComponent = {
		UserList: <UserList />,
		OpenChatList: <OpenChatList chatSocket={socket} />,
		FriendsList: <FriendsList />,
		DirectMessageList: <DirectMessageList />,
		DMRoom: <DMRoom />,
		NewOpenChatRoom: <NewOpenChatRoom chatSocket={socket} />,
		OpenChatRoom: <OpenChatRoom chatSocket={socket} />,
		OpenChatInvite: <OpenChatInvite chatSocket={socket} />,
		EditOpenChatRoom: <EditOpenChatRoom chatSocket={socket} />,
		ProtectedPassword: <ProtectedPassword chatSocket={socket} />,
		OpenChatUsers: <OpenChatUsers chatSocket={socket} />,
	};

	useEffect(() => {
		if (isLoading || error || !userData) return () => {};
		emitJoinChat(socket, userData.id, userData.nickname);
		socket.on('listeningMe', (response: IMyDataResponse) => {
			setMyInfo(response.data);
			setRequestUsers(response.data.friendsRequest);
			setFriendsUsers(response.data.friends);
			setBlockedUsers(response.data.blockedUsers);
		});
		socket.on('listeningGetUsers', (response: { data: IUserData[] }) => {
			setUsers(response.data);
		});
		socket.on('listeningDMRoomList', (response: { data: IDMRoom[] }) => {
			setRooms(response.data);
		});
		socket.on('listeningChannelList', (response: { data: IChannel[] }) => {
			setChannelList(response.data);
		});
		socket.on('chatError', (message: IErr) => {
			alert(message);
		});
		return () => {
			socket.off('connect');
			socket.off('listeningMe');
			socket.off('listeningGetUsers');
			socket.off('listeningDMRoomList');
			socket.off('listeningChannelList');
			socket.off('listeningChannelInfo');
			socket.off('chatError');
		};
	}, [isLoading, error, userData]);

	// useEffect(() => {
	// 	if (isLoading || error || !userData) return;
	// 	console.log('여기 들어오면 안되는데');
	// 	const socketIo: Socket = io('http://3.39.20.24:3032/api/chat');
	// 	setSocket(socketIo);
	// }, [isLoading, error, setSocket]);

	return isLoading ? null : (
		<ChatC>
			{/* <SearchInput /> */}
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}

export default Chat;
