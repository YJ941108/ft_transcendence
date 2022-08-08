import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { channelListInfo } from '../../../modules/atoms';
import OpenChatNewButton from './OpenChatNewButton';
import { IChannel } from '../../../modules/Interfaces/chatInterface';
import OpenChatInfo from './OpenChatInfo';

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

function OpenChatList({ chatSocket }: any) {
	const [channelList, setChannelList] = useRecoilState<IChannel[]>(channelListInfo);
	useEffect(() => {
		console.log(channelList, 'channelList');
		chatSocket.on('listeningChannelInfo', (channel: IChannel) => {
			setChannelList((curr: IChannel[]) => {
				return [...curr, channel];
			});
		});
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
