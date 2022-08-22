import React from 'react';
import IUserData from '../../../modules/Interfaces/userInterface';

interface IOpenChatMessageProps {
	author: IUserData;
	content: string;
}

function OpenChatMessage({ author, content }: IOpenChatMessageProps) {
	return (
		<li>
			<span>
				{author?.nickname} : {content}
			</span>
		</li>
	);
}

export default OpenChatMessage;
