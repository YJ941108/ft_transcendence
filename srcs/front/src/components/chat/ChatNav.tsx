import React from 'react';
import styled from 'styled-components';
import ChatNavButton from './ChatNavButton';

const ChatNavStyleC = styled.div`
	width: 100%;
`;

function ChatNav() {
	return (
		<ChatNavStyleC>
			<ChatNavButton name="UserList" />
			<ChatNavButton name="OpenChatList" />
			<ChatNavButton name="FriendsList" />
			<ChatNavButton name="DirectMessageList" />
		</ChatNavStyleC>
	);
}

export default ChatNav;
