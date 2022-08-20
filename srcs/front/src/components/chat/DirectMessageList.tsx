import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { DMRoomList } from '../../modules/atoms';
import DirectMessageInfo from './li-DirectMessage';
import { IDMRoom } from '../../modules/Interfaces/chatInterface';
import { useChatSocket } from './SocketContext';

const DirectMessageListC = styled.ul`
	list-style: none;
	width: 100%;
	min-height: 800px;
	max-height: 800px;
	vertical-align: baseline;
	box-sizing: border-box;
	overflow-y: scroll;
`;

function DirectMessageList() {
	const chatSocket = useChatSocket();
	const [rooms, setRooms] = useRecoilState<IDMRoom[]>(DMRoomList);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.emit('requestMyDMList');
		}
	}, []);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMRoomList', (response: { data: IDMRoom[] }) => {
				setRooms(response.data);
			});

			return () => {
				chatSocket.off('listeningDMRoomList');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<DirectMessageListC>
			{rooms?.map((element: IDMRoom) => {
				return (
					<DirectMessageInfo
						key={element.id}
						nickname={element.another.nickname}
						id={element.another.id}
						photo={element.another.photo}
						chatSocket={chatSocket}
						isOnline={element.another.isOnline}
						lastMsg={element.message}
					/>
				);
			})}
		</DirectMessageListC>
	);
}

export default DirectMessageList;
