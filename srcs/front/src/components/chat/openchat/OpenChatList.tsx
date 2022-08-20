import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
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

function OpenChatList() {
	const channelList = useRecoilValue<IChannel[]>(channelListInfo);

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
