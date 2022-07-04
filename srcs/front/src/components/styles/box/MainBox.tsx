import styled from 'styled-components';
import React from 'react';

interface IMainBoxProps {
	children?: React.ReactNode;
}

const MainBoxStyle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

function MainBox({ children }: IMainBoxProps) {
	return <MainBoxStyle>{children}</MainBoxStyle>;
}

export default MainBox;
