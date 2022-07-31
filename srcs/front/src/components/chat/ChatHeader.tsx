import React from 'react';
import styled from 'styled-components';
import SearchInput from './SearchInput';

const ChatHeaderC = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	height: 2rem;
	background-color: blue;
`;

function ChatHeader() {
	return (
		<ChatHeaderC>
			<SearchInput />
		</ChatHeaderC>
	);
}

export default ChatHeader;
