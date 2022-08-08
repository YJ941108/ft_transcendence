import React from 'react';
import styled from 'styled-components';
import ChatNavButton from './ChatNavButton';
import UserList from '../../img/alluser.png';
import DirectMessageList from '../../img/directmessage.png';
import FriendsList from '../../img/friends.png';
import OpenChatList from '../../img/openchat.png';

const ChatNavStyleC = styled.div`
	width: 100%;
`;

function ChatNav() {
	return (
		<ChatNavStyleC>
			<ChatNavButton name="UserList" imgSrc={UserList} />
			<ChatNavButton name="OpenChatList" imgSrc={OpenChatList} />
			<ChatNavButton name="FriendsList" imgSrc={FriendsList} />
			<ChatNavButton name="DirectMessageList" imgSrc={DirectMessageList} />
		</ChatNavStyleC>
	);
}

export default ChatNav;
