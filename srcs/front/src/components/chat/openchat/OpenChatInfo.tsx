import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { MyInfo } from '../../../modules/atoms';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
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

function OpenChatInfo({ channelInfo }: IOpenChatInfoProps) {
	const chatSocket = useChatSocket();
	const myInfo = useRecoilValue<IMyData>(MyInfo);

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
