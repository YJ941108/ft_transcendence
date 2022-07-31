import React from 'react';
import styled from 'styled-components';

const ChatListStyleC = styled.li`
	padding: 10px;
	height: 80px;
	border-bottom: 3px solid black;
`;

// interface IChatListProps {
// 	children: React.ReactNode;
// }

function ChatList() {
	return <ChatListStyleC />;
}

export default ChatList;
