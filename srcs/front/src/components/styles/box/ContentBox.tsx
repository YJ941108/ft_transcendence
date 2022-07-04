import React from 'react';
import styled from 'styled-components';

const ContentBoxC = styled.div`
	width: 40%;
`;

interface IContentBoxProps {
	children?: React.ReactNode;
}

function ContentBox({ children }: IContentBoxProps) {
	return <ContentBoxC></ContentBoxC>;
}

export default ContentBox;
