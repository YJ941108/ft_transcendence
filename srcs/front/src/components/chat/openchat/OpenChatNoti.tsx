import React from 'react';
import styled from 'styled-components';

const OpenChatMessageStyleC = styled.li`
	margin: 3px;
`;

interface IOpenChatNoti {
	content: string;
}

function OpenChatNoti({ content }: IOpenChatNoti) {
	return <OpenChatMessageStyleC>{content}</OpenChatMessageStyleC>;
}

export default OpenChatNoti;
