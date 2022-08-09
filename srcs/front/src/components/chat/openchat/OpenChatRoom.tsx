import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { channelInfoData, chatContent } from '../../../modules/atoms';
import { IChannel } from '../../../modules/Interfaces/chatInterface';

function OpenChatRoom({ chatSocket }: any) {
	const setChannelInfo = useSetRecoilState(channelInfoData);
	const setChatContent = useSetRecoilState(chatContent);

	useEffect(() => {
		chatSocket.on('listeningChannelInfo', (channel: IChannel) => {
			setChannelInfo(channel);
			console.log(channel, 'listeningChannelInfo');
		});
		return () => {
			chatSocket.off('listeningChannelInfo');
		};
	}, [chatSocket]);
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
