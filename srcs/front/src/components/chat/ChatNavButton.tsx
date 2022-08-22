import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { chatContent } from '../../modules/atoms';

interface IColor {
	color: string;
}

const ChatNavButtonStyleC = styled.button<IColor>`
	width: 25%;
	height: 4rem;
	border: none;
	font-size: 12px;
	background-color: ${(props) => props.theme.black};
	border-top: 2px solid ${(props) => props.theme.white};
	/* color: ${(props) => props.theme.white}; */
	color: ${(props) => props.color};
	&:hover {
		background-color: ${(props) => props.theme.darkGray};
	}
`;

// const ChatButtonIconStyleC = styled.img`
// 	top: 5px;
// `;

interface IChatNavButton {
	name: string;
	title: string;
}

function ChatNavButton({ name, title }: IChatNavButton) {
	const [color, setColor] = useState('white');
	const content = useRecoilValue(chatContent);

	useEffect(() => {
		if (content === name) {
			setColor('red');
		} else setColor('white');
	});

	const setUList = useSetRecoilState(chatContent);
	return (
		<ChatNavButtonStyleC
			type="button"
			color={color}
			onClick={() => {
				setUList(name);
			}}
		>
			{title}
		</ChatNavButtonStyleC>
	);
}

// function ChatNavButton({ name, imgSrc }: IChatNavButton) {
// 	const setAllUserList = useSetRecoilState(chatContent);
// 	return (
// 		<ChatNavButtonStyleC type="button" onClick={() => setAllUserList(name)}>
// 			<ChatButtonIconStyleC src={imgSrc} width="16px" alt={name} />
// 		</ChatNavButtonStyleC>
// 	);
// }

export default ChatNavButton;
