import React from 'react';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { chatContent } from '../../../modules/atoms';

const NewChatButtonStyleC = styled.button`
	border: none;
	border-bottom: 1px solid white;
	height: 85px;
	width: 100%;
	background-color: black;
	color: white;
	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
`;

function OpenChatNewButton() {
	const setContent = useSetRecoilState(chatContent);
	return (
		<NewChatButtonStyleC type="button" onClick={() => setContent('NewOpenChatRoom')}>
			+ NEW CHAT
		</NewChatButtonStyleC>
	);
}

export default OpenChatNewButton;
