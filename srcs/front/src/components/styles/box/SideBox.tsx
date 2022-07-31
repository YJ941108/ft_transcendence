import React from 'react';
import styled from 'styled-components';
import ChatButton from '../../chat/ChatButton';

interface ISideBoxProps {
	children?: React.ReactNode;
}

const SideBoxC = styled.div`
	width: 20rem;
	height: 100vh;
`;

const defaultProps = {
	children: null,
};

export default function SideBox({ children }: ISideBoxProps) {
	return (
		<SideBoxC>
			{children}
			<ChatButton />
		</SideBoxC>
	);
}
SideBox.defaultProps = defaultProps;
