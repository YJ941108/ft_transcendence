import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { Socket } from 'socket.io-client';
import IUserData from '../../modules/Interfaces/userInterface';
import { DMRoomList } from '../../modules/atoms';
import DirectMessageInfo from './DirectMessage';

const DirectMessageListC = styled.ul`
	list-style: none;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
	padding: 5px;
	vertical-align: baseline;
	box-sizing: border-box;
	overflow-y: scroll;
`;

interface ISocket {
	chatSocket: Socket;
}

function DirectMessageList({ chatSocket }: ISocket) {
	const [rooms, setRooms] = useRecoilState<IUserData[]>(DMRoomList);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMRoomList', (response: { data: IUserData[] }) => {
				console.log(response, 'listeningDMRoomList');
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
			{rooms?.map((element: IUserData) => {
				return (
					<DirectMessageInfo
						key={element.id}
						id={element.id}
						nickname={element.nickname}
						photo={element.photo}
						chatSocket={chatSocket}
						isOnline={element.isOnline}
					/>
				);
			})}
		</DirectMessageListC>
	);
}

export default DirectMessageList;
