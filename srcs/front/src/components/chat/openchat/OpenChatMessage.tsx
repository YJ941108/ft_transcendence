import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import IUserData from '../../../modules/Interfaces/userInterface';

const OpenChatMessageStyleC = styled.li`
	margin: 3px;
`;

interface IOpenChatMessageProps {
	author: IUserData;
	content: string;
}

function OpenChatMessage({ author, content }: IOpenChatMessageProps) {
	return (
		<OpenChatMessageStyleC>
			<Link to={`/main/another/${author?.nickname}`}>{author?.nickname}</Link> : {content}
		</OpenChatMessageStyleC>
	);
}

export default OpenChatMessage;
