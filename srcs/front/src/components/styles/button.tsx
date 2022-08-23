import React from 'react';
import styled from 'styled-components';

type Props = {
	children: React.ReactNode;
	onClick: () => void;
	type: 'submit' | 'reset' | 'button';
};

const DefaultButton = styled.button`
	color: white;
	background: black;
	border: 1px dashed white;
	border-radius: 5rem;
	margin-top: 1rem;
	width: 100%;
	height: 2rem;
	line-height: 1rem;
	text-align: center;
	font-size: 1rem;
	cursor: pointer;
	&:hover {
		background: white;
		color: black;
	}
`;

function Button({ children, onClick, type }: Props) {
	return (
		<DefaultButton onClick={onClick} type={type}>
			{children}
		</DefaultButton>
	);
}
export default Button;
