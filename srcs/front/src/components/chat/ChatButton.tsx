// import React from 'react';
import React, { useState } from 'react';
import styled from 'styled-components';
import Chat from './Chat';

const ChatButtsonStyleC = styled.div`
	background-color: red;
	height: 3.5rem;
	width: 3.5rem;
	border-radius: 4px;
	float: right;
	/* position: absolute; */
	/* bottom: 0; */
	margin: 5%;
`;

function ChatButton() {
	const [visible, setVisible] = useState(false);
	const checkVisible = () => {
		setVisible(!visible);
	};

	return (
		<>
			{visible ? <Chat /> : null}
			<ChatButtsonStyleC onClick={checkVisible} />
		</>
	);
}

export default ChatButton;
