import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { chatContentC } from '../../modules/atoms';
import SearchInput from './SearchInput';
import ChatNav from './ChatNav';
import UserList from './UserList';
import OpenChatList from './OpenChatList';
import FriendsList from './FriendsList';
import DirectMessageList from './DirectMessageList';

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
	const content = useRecoilValue(chatContentC);

	const selectComponent: ISelectComponent = {
		UserList: <UserList />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList />,
		DirectMessageList: <DirectMessageList />,
	};

	return (
		<ChatC>
			<SearchInput />
			{selectComponent[content]}
			<ChatNav />
		</ChatC>
	);
}

export default Chat;
