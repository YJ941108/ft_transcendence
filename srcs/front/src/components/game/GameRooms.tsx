import React from 'react';
import { Socket } from 'socket.io-client';
import styled from 'styled-components';
import PlayerInfo from '../chat/PlayerInfo';
import { IRoom } from './GameInterfaces';

const GameRoomliStyleC = styled.li`
	margin: 30px;
	padding: 20px;
	border: 2px solid white;
	width: 600px;
	text-align: center;
`;

const SpectateButtonStyleC = styled.button`
	margin-top: 10px;
	border: none;
	color: white;
	background-color: black;
`;

interface IGameRoomsProps {
	gameRooms: IRoom[];
	socket: Socket;
}

const GameRoomListStyleC = styled.ul`
	/* background-color: red; */
`;

function GameRooms({ gameRooms, socket }: IGameRoomsProps) {
	const onEnterGameRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit('spectateRoom', event.currentTarget.value);
	};
	return (
		<GameRoomListStyleC>
			{gameRooms.map((gameRoom) => {
				return (
					<GameRoomliStyleC key={gameRoom.roomId}>
						<SpectateButtonStyleC onClick={onEnterGameRoom} type="button" value={gameRoom.roomId}>
							Spectate
						</SpectateButtonStyleC>
						<PlayerInfo leftPlayer={gameRoom.paddleOne} rightPlayer={gameRoom.paddleTwo} />
					</GameRoomliStyleC>
				);
			})}
		</GameRoomListStyleC>
	);
}

export default GameRooms;
