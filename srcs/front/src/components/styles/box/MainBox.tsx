import styled from 'styled-components';
import React from 'react';

const MainBoxStyle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

interface IMainBoxProps {
	children?: React.ReactNode;
}

const defaultProps = {
	children: null,
};

function MainBox({ children }: IMainBoxProps) {
	return <MainBoxStyle>{children}</MainBoxStyle>;
}
MainBox.defaultProps = defaultProps;

export default MainBox;
