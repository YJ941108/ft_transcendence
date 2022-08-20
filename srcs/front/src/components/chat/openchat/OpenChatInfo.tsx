import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
import { channelInfoData, chatContent, channelIdData, MyInfo } from '../../../modules/atoms';
import { useChatSocket } from '../SocketContext';

const OpenChatStyleC = styled.li`
	display: flex;
	align-items: center;
	height: 85px;
	border-bottom: 1px solid rgba(255, 255, 255, 1);
	overflow: hidden;
	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	&:last-of-type {
		border: none;
	}
`;

const OpenChatDivStyleC = styled.div`
	max-width: 70%;
	margin: 5px;
	p {
		margin: 3px 0;
	}
`;

interface IOpenChatInfoProps {
	channelInfo: IChannel;
}

interface IJoinPossible {
	func: string;
	code: number;
	message: string;
}

function OpenChatInfo({ channelInfo }: IOpenChatInfoProps) {
	const chatSocket = useChatSocket();
	const setChannelInfo = useSetRecoilState<IChannel>(channelInfoData);
	const setContent = useSetRecoilState<string>(chatContent);
	const setChannelId = useSetRecoilState<number>(channelIdData);
	const myInfo = useRecoilValue<IMyData>(MyInfo);

	useEffect(() => {
		chatSocket.on('listeningJoinPossible', (response: IJoinPossible) => {
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
	}, [chatSocket]);
	const onClick = () => {
		chatSocket.emit('isJoinPossible', {
			channelId: channelInfo.id,
			userId: myInfo.id,
		});
	};
	return (
		<OpenChatStyleC onClick={onClick}>
			<OpenChatDivStyleC>
				<p>{channelInfo.name}</p>
				<p>{channelInfo.privacy}</p>
				<p>{channelInfo.users.length}</p>
			</OpenChatDivStyleC>
		</OpenChatStyleC>
	);
}

export default OpenChatInfo;
