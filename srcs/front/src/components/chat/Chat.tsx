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
	font-family: ${(props) => props.theme.font};
	font-size: 16px;
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
	const [, setMyInfo] = useRecoilState<IMyData>(MyInfo);
	const [, setRooms] = useRecoilState<IDMRoom[]>(DMRoomList);
	const [, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const [, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [, setFriendsUsers] = useRecoilState<IUserData[]>(friendsList);
	const [, setBlockedUsers] = useRecoilState<IUserData[]>(blockedList);
	const [, setChannelList] = useRecoilState<IChannel[]>(channelListInfo);

	const selectComponent: ISelectComponent = {
		UserList: <UserList />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList />,
		DirectMessageList: <DirectMessageList />,
		DMRoom: <DMRoom />,
		NewOpenChatRoom: <NewOpenChatRoom />,
		OpenChatRoom: <OpenChatRoom />,
		OpenChatInvite: <OpenChatInvite />,
		EditOpenChatRoom: <EditOpenChatRoom />,
		ProtectedPassword: <ProtectedPassword />,
		OpenChatUsers: <OpenChatUsers />,
	};

	useEffect(() => {
		if (isLoading || error || !userData) return () => {};
		emitJoinChat(socket, userData.id, userData.nickname);
		return () => {};
	}, [userData]);

	useEffect(() => {
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
			alert(message.message);
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

	return isLoading ? null : (
		<ChatC>
			{/* <SearchInput /> */}
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}

export default Chat;
