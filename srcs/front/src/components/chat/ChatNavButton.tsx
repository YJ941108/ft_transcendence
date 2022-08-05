import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState } from 'recoil';
import { chatContent } from '../../modules/atoms';

const ChatNavButtonStyleC = styled.button`
	width: 25%;
	height: 3rem;
`;

interface IChatNavButton {
	name: string;
}

function ChatNavButton({ name }: IChatNavButton) {
	const setAllUserList = useSetRecoilState(chatContent);
	return <ChatNavButtonStyleC onClick={() => setAllUserList(name)}>{name}</ChatNavButtonStyleC>;
}

export default ChatNavButton;
