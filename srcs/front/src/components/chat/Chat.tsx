import React, { useState } from 'react';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import ChatNav from './ChatNav';
import AllUserList from './AllUserList';
import OpenChatList from './OpenChatList';
import FriendsList from './FriendsList';
import DirectMessageList from './DirectMessageList';

const ChatC = styled.div`
	width: 300px;
	position: absolute;
	top: 3.5rem;
	/* background-color: red; */
`;

interface ISelectComponent {
	[index: string]: React.ReactNode;
	AllUserList: React.ReactNode;
	OpenChatList: React.ReactNode;
	FriendsList: React.ReactNode;
	DirectMessageList: React.ReactNode;
}

function Chat() {
	const [content, setContent] = useState('AllUserList');

	const changeContent = (event: React.MouseEvent<HTMLButtonElement>) => {
		setContent(event.currentTarget.name);
	};

	const selectComponent: ISelectComponent = {
		AllUserList: <AllUserList />,
		OpenChatList: <OpenChatList />,
		FriendsList: <FriendsList />,
		DirectMessageList: <DirectMessageList />,
	};

	return (
		<ChatC>
			<ChatHeader />
			{selectComponent[content]}
			<ChatNav func={changeContent} />
		</ChatC>
	);
}

export default Chat;
