import React from 'react';
import styled from 'styled-components';
import ChatNavButton from './ChatNavButton';

const ChatNavStyleC = styled.div`
	width: 100%;
	/* background-color: black; */
`;

interface IChatNav {
	func: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ChatNav({ func }: IChatNav) {
	return (
		<ChatNavStyleC>
			<ChatNavButton func={func} name="AllUserList" />
			<ChatNavButton func={func} name="OpenChatList" />
			<ChatNavButton func={func} name="FriendsList" />
			<ChatNavButton func={func} name="DirectMessageList" />
		</ChatNavStyleC>
	);
}

export default ChatNav;
