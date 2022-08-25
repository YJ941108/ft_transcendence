import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import OpenChatNewButton from './OpenChatNewButton';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
// import OpenChatInfo from './OpenChatInfo';
import { channelInfoData, chatContent, channelIdData, channelListInfo, MyInfo } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';
import ListStyle from '../UserInfoStyle';
import ListSection from '../ListSection';

const OpenChatListStyleC = styled.ul`
	background-color: black;
	width: 100%;
	min-height: 800px;
	max-height: 800px;
`;

const OpenChatDataStyleC = styled.div`
	margin: 5px 0;
	cursor: pointer;
`;

const OpenChatDataPStyleC = styled.p`
	margin: 5px 0;
`;

const OpenChatListC = styled.ul`
	list-style: none;
	width: 100%;
	min-height: 800px;
	max-height: 800px;
	/* padding: 5px; */
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

	const myInfo = useRecoilValue<IMyData>(MyInfo);

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

	const ChatJoin = (channelInfo: IChannel) => {
		chatSocket.emit('isJoinPossible', {
			channelId: channelInfo.id,
			userId: myInfo.id,
		});
	};

	return (
		<OpenChatListStyleC>
			<OpenChatListC>
				<ListSection title="OPEN CHAT" />
				<OpenChatNewButton />
				{channelList.map((channel: IChannel) => {
					return (
						<ListStyle key={channel.id} user={channel.owner}>
							<OpenChatDataStyleC
								onClick={() => {
									ChatJoin(channel);
								}}
							>
								<OpenChatDataPStyleC>{channel.name}</OpenChatDataPStyleC>
								<OpenChatDataPStyleC>{channel.privacy.toUpperCase()}</OpenChatDataPStyleC>
								<OpenChatDataPStyleC>{channel.users.length}USERS</OpenChatDataPStyleC>
							</OpenChatDataStyleC>
						</ListStyle>
					);
				})}
			</OpenChatListC>
		</OpenChatListStyleC>
	);
}

export default OpenChatList;
