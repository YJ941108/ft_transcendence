import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState } from 'recoil';
import { Socket } from 'socket.io-client';
import { emitCreateDMRoom, emitUserAction } from './Emit';
// import { IUserList } from '../../modules/Interfaces/userInterface';
import { chatContent } from '../../modules/atoms';
import { IMessages } from '../../modules/Interfaces/chatInterface';

const UserPhotoDivStyleC = styled.div`
	width: 70px;
	height: 70px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.2);
	margin: 0 5px;
`;

const UserPhotoStyleC = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const UserInfoDivStyleC = styled.div`
	max-width: 70%;
	margin: 5px;
`;

const UserNickNameStyleC = styled.p`
	margin: 3px 0;
`;

const LastMessageDivStyleC = styled.div`
	width: 100%;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

const UserStyleC = styled.li`
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

interface IDMList {
	id: number;
	nickname: string;
	photo: string;
	chatSocket: Socket;
	isOnline: boolean;
	lastMsg: IMessages[];
}

function DirectMessageInfo({ id, nickname, photo, chatSocket, isOnline, lastMsg }: IDMList) {
	const lastMessage = lastMsg.at(-1)?.content;
	const createDMRoom = useSetRecoilState(chatContent);
	return (
		<UserStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={photo} alt={nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{nickname}</UserNickNameStyleC>
				<LastMessageDivStyleC>{lastMessage}</LastMessageDivStyleC>
				{isOnline ? <UserNickNameStyleC>ONLINE</UserNickNameStyleC> : <UserNickNameStyleC>OFFLINE</UserNickNameStyleC>}
				<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, nickname, 'request')}>
					ADD
				</UserInteractionStyleC>
				<UserInteractionStyleC>PLAY</UserInteractionStyleC>
				<UserInteractionStyleC
					onClick={() => {
						emitCreateDMRoom(chatSocket, id);
						createDMRoom('DMRoom');
					}}
				>
					MSG
				</UserInteractionStyleC>
			</UserInfoDivStyleC>
		</UserStyleC>
	);
}

export default DirectMessageInfo;
