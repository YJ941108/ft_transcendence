import React from 'react';
import { Link } from 'react-router-dom';
import IUserData from '../../../modules/Interfaces/userInterface';

interface IOpenChatMessageProps {
	author: IUserData;
	content: string;
}

function OpenChatMessage({ author, content }: IOpenChatMessageProps) {
	return (
		<li>
			<Link to={`/main/another/${author?.nickname}`}>{author?.nickname}</Link> : {content}
		</li>
	);
}

export default OpenChatMessage;
