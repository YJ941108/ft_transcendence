import React from 'react';
import styled from 'styled-components';

const ContentBoxC = styled.div`
	//width: 68rem;
`;

interface IContentBoxProps {
	children?: React.ReactNode;
}

const TopBarStyledC = styled.div`
	height: 100px;
	min-width: 500px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	border-bottom: 3px solid white;
`;

const TopBarContentStyleC = styled.p`
	font-size: 2rem;
`;

const defaultProps = {
	children: null,
};

const ContentStyleC = styled.div`
	margin: 5px;
`;

function ContentBox({ children }: IContentBoxProps) {
	return (
		<ContentBoxC>
			<TopBarStyledC>
				<TopBarContentStyleC>TOP BAR</TopBarContentStyleC>
			</TopBarStyledC>
			<ContentStyleC>{children}</ContentStyleC>
		</ContentBoxC>
	);
}
ContentBox.defaultProps = defaultProps;

export default ContentBox;
