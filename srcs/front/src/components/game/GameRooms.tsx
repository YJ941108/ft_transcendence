import React from 'react';
import { Socket } from 'socket.io-client';
import { IRoom } from './GameInterfaces';

interface IGameRoomsProps {
	gameRooms: IRoom[];
	socket: Socket;
}

function GameRooms({ gameRooms, socket }: IGameRoomsProps) {
	const onEnterGameRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit('spectateRoom', event.currentTarget.value);
	};
	return (
		<ul>
			{gameRooms.map((gameRoom) => {
				return (
					<li key={gameRoom.roomId}>
						<span>{gameRoom.roomId}</span>
						<button onClick={onEnterGameRoom} type="button" value={gameRoom.roomId}>
							<span>Spectate</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}

export default GameRooms;
