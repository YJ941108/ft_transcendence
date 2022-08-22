import React from 'react';

interface IOpenChatNoti {
	content: string;
}

function OpenChatNoti({ content }: IOpenChatNoti) {
	return (
		<li>
			<span>{content}</span>
		</li>
	);
}

export default OpenChatNoti;
