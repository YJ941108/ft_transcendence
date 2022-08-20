import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState } from 'recoil';
import { chatContent } from '../../modules/atoms';

const ChatNavButtonStyleC = styled.button`
	width: 25%;
	height: 4rem;
	background-color: white;
	/* border: 1px solid rgba(0, 0, 0, 0.5); */
	border: none;
	background-color: rgba(255, 255, 255, 0.9);
	&:hover {
		background-color: rgba(150, 150, 150, 0.1);
	}
`;

const ChatButtonIconStyleC = styled.img`
	top: 5px;
`;

interface IChatNavButton {
	name: string;
	imgSrc: string;
}

function ChatNavButton({ name, imgSrc }: IChatNavButton) {
	const setAllUserList = useSetRecoilState(chatContent);
	return (
		<ChatNavButtonStyleC type="button" onClick={() => setAllUserList(name)}>
			<ChatButtonIconStyleC src={imgSrc} width="16px" alt={name} />
		</ChatNavButtonStyleC>
	);
}

export default ChatNavButton;
