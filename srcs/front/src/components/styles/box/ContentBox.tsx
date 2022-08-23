import React from 'react';
import styled from 'styled-components';
import TopBar from '../../TopBar';

const ContentBoxC = styled.div`
	//width: 68rem;
`;

interface IContentBoxProps {
	children?: React.ReactNode;
}

const defaultProps = {
	children: null,
};

function ContentBox({ children }: IContentBoxProps) {
	return (
		<ContentBoxC>
			<TopBar />
			{children}
		</ContentBoxC>
	);
}
ContentBox.defaultProps = defaultProps;

export default ContentBox;
