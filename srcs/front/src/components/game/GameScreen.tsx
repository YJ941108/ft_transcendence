import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import GameData from './GameData';
import { IRoom } from './GameInterfaces';

interface IGameScreenProps {
	socketProps: Socket;
	roomDataProps: any;
}

function GameScreen({ socketProps, roomDataProps }: IGameScreenProps) {
	const socket: Socket = socketProps;
	const room: IRoom = roomDataProps;

	useEffect(() => {
		const gameData = new GameData(socket, room);
		console.log(gameData);
	}, []);
	const leaveRoom = () => {
		socket.emit('leaveRoom');
	};
	console.log(room, 'room data');
	return (
		<div>
			<canvas id="pixi-canvas" width="600" height="300" />
			<button onClick={leaveRoom} type="button">
				leave room
			</button>
		</div>
	);
}

export default GameScreen;
