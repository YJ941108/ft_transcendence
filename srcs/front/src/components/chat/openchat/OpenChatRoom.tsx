import React, { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { channelInfoData, chatContent } from '../../../modules/atoms';

function OpenChatRoom({ chatSocket }: any) {
	const [channelInfo, setChannelInfo] = useRecoilState(channelInfoData);
	const setChatContent = useSetRecoilState(chatContent);
	useEffect(() => {
		console.log(chatSocket);
		setChannelInfo(channelInfo);
	}, []);
	const joinChat = () => {
		setChatContent('OpenChatInvite');
	};
	return (
		<div>
			<button type="button" onClick={joinChat}>
				joinChat
			</button>
		</div>
	);
}

export default OpenChatRoom;
