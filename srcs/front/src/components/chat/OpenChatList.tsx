import React from 'react';
import styled from 'styled-components';
import OpenChatNewButton from './openchat/OpenChatNewButton';

const OpenChatListStyleC = styled.ul`
	background-color: black;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
`;
function OpenChatList() {
	return (
		<OpenChatListStyleC>
			<OpenChatNewButton />
		</OpenChatListStyleC>
	);
}

export default OpenChatList;
