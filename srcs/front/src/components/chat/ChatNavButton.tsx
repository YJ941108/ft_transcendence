import React from 'react';
import styled from 'styled-components';

const ChatNavButtonStyleC = styled.button`
	width: 25%;
	height: 3rem;
`;

interface IChatNavButton {
	func: (event: React.MouseEvent<HTMLButtonElement>) => void;
	name: string;
}

function ChatNavButton({ func, name }: IChatNavButton) {
	return (
		<ChatNavButtonStyleC onClick={func} name={name}>
			{name}
		</ChatNavButtonStyleC>
	);
}

export default ChatNavButton;
