import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState } from 'recoil';
import { emitCreateDMRoom, emitUserAction } from './Emit';
import { chatContent } from '../../modules/atoms';
import { IDMRoom } from '../../modules/Interfaces/chatInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import { Nickname } from './UserStatus';

const UserNickNameStyleC = styled.p`
	margin: 3px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const LastMessageDivStyleC = styled.div`
	width: 80%;
	height: 1rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

interface IDMRoomList {
	DMRoom: IDMRoom;
}

function DirectMessageInfo({ DMRoom }: IDMRoomList) {
	const lastMessage = DMRoom.message.at(-1)?.content;
	const chatSocket = useChatSocket();
	const createDMRoom = useSetRecoilState(chatContent);
	return (
		<ListStyle user={DMRoom.another}>
			<Nickname nickname={DMRoom.another.nickname} />
			{/* <UserNickNameStyleC>{DMRoom.another.nickname}</UserNickNameStyleC> */}
			{DMRoom.another.isOnline ? (
				<UserNickNameStyleC>ONLINE</UserNickNameStyleC>
			) : (
				<UserNickNameStyleC>OFFLINE</UserNickNameStyleC>
			)}
			<LastMessageDivStyleC>{lastMessage}</LastMessageDivStyleC>
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, DMRoom.another.nickname, 'request')}>
				ADD
			</UserInteractionStyleC>
			<UserInteractionStyleC>PLAY</UserInteractionStyleC>
			<UserInteractionStyleC
				onClick={() => {
					emitCreateDMRoom(chatSocket, DMRoom.another.id);
					createDMRoom('DMRoom');
				}}
			>
				MSG
			</UserInteractionStyleC>
		</ListStyle>
	);
}

export default DirectMessageInfo;
