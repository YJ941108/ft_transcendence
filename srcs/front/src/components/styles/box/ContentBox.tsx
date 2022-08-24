import React from 'react';
import styled from 'styled-components';

const ContentBoxC = styled.div`
	//width: 68rem;
`;

interface IContentBoxProps {
	children?: React.ReactNode;
}

const defaultProps = {
	children: null,
};

const ContentStyleC = styled.div`
	margin: 5px;
`;

function ContentBox({ children }: IContentBoxProps) {
	return (
		<ContentBoxC>
			<ContentStyleC>{children}</ContentStyleC>
		</ContentBoxC>
	);
}
ContentBox.defaultProps = defaultProps;

export default ContentBox;
