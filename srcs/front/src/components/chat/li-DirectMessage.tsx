import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState } from 'recoil';
import { emitCreateDMRoom } from './Emit';
import { chatContent } from '../../modules/atoms';
import { IDMRoom } from '../../modules/Interfaces/chatInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import { Nickname } from './UserStatus';

const LastMessageDivStyleC = styled.div`
	width: 80%;
	height: 1rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
`;

const LastMessageTimeStyleC = styled.div`
	width: 80%;
	height: 1rem;
	margin-top: 3px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
`;

interface IDMRoomList {
	DMRoom: IDMRoom;
}

function DirectMessageInfo({ DMRoom }: IDMRoomList) {
	const lastMessage = DMRoom.message.at(-1)?.content;
	const lastMessageTime = DMRoom.message.at(-1)?.createdAt;
	const chatSocket = useChatSocket();
	const createDMRoom = useSetRecoilState(chatContent);
	return (
		<ListStyle user={DMRoom.another}>
			<Nickname nickname={DMRoom.another.nickname} />
			<LastMessageDivStyleC
				onClick={() => {
					emitCreateDMRoom(chatSocket, DMRoom.another.id);
					createDMRoom('DMRoom');
				}}
			>
				{lastMessage}
			</LastMessageDivStyleC>
			<LastMessageTimeStyleC
				onClick={() => {
					emitCreateDMRoom(chatSocket, DMRoom.another.id);
					createDMRoom('DMRoom');
				}}
			>
				{lastMessageTime?.substring(0, 10)}
			</LastMessageTimeStyleC>
			{/* <FriendsStatus user={DMRoom.another} /> */}
			{/* <UserInteractionStyleC onClick={() => emitUserAction(chatSocket, DMRoom.another.nickname, 'request')}>
				ADD
			</UserInteractionStyleC> */}
			{/* <UserInteractionStyleC>PLAY</UserInteractionStyleC>
			<UserInteractionStyleC
				onClick={() => {
					emitCreateDMRoom(chatSocket, DMRoom.another.id);
					createDMRoom('DMRoom');
				}}
			>
				MSG
			</UserInteractionStyleC> */}
		</ListStyle>
	);
}

export default DirectMessageInfo;
