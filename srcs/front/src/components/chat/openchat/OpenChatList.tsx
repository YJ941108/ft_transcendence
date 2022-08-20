import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import OpenChatNewButton from './OpenChatNewButton';
import { IChannel } from '../../../modules/Interfaces/chatInterface';
import OpenChatInfo from './OpenChatInfo';
import { channelInfoData, chatContent, channelIdData, channelListInfo } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';

const OpenChatListStyleC = styled.ul`
	background-color: black;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
`;

const OpenChatListC = styled.ul`
	list-style: none;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
	padding: 5px;
	vertical-align: baseline;
	box-sizing: border-box;
	overflow-y: scroll;
`;

interface IJoinPossible {
	func: string;
	code: number;
	data: IChannel;
	message: string;
}

function OpenChatList() {
	const chatSocket = useChatSocket();
	const channelList = useRecoilValue<IChannel[]>(channelListInfo);
	const setChannelInfo = useSetRecoilState<IChannel>(channelInfoData);
	const setContent = useSetRecoilState<string>(chatContent);
	const setChannelId = useSetRecoilState<number>(channelIdData);

	useEffect(() => {
		chatSocket.on('listeningJoinPossible', (response: IJoinPossible) => {
			const channelInfo = response.data;
			if (response.code === 200) {
				if (channelInfo.privacy === 'protected') {
					setChannelInfo(channelInfo);
					setChannelId(channelInfo.id);
					setContent('ProtectedPassword');
				} else {
					setChannelInfo(channelInfo);
					setChannelId(channelInfo.id);
					setContent('OpenChatRoom');
				}
			}
		});
		return () => {
			chatSocket.off('listeningJoinPossible');
		};
	}, [chatSocket]);

	return (
		<OpenChatListStyleC>
			<OpenChatNewButton />
			<OpenChatListC>
				{channelList.map((channel: IChannel) => {
					return <OpenChatInfo key={channel.id} channelInfo={channel} />;
				})}
			</OpenChatListC>
		</OpenChatListStyleC>
	);
}

export default OpenChatList;
