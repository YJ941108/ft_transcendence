import React from 'react';
import styled from 'styled-components';
import ChatNavButton from './ChatNavButton';

const ChatNavStyleC = styled.div`
	/* width: 100%; */
`;

function ChatNav() {
	return (
		<ChatNavStyleC>
			<ChatNavButton name="UserList" imgSrc="/img/alluser.png" />
			<ChatNavButton name="OpenChatList" imgSrc="/img/openchat.png" />
			<ChatNavButton name="FriendsList" imgSrc="/img/friends.png" />
			<ChatNavButton name="DirectMessageList" imgSrc="/img/directmessage.png" />
		</ChatNavStyleC>
	);
}

export default ChatNav;
