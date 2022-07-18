import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import GameData from './GameData';
import { IRoom, IUser, IKey } from './GameInterfaces';

interface IGameScreenProps {
	socketProps: Socket;
	roomDataProps: any;
}

function GameScreen({ socketProps, roomDataProps }: IGameScreenProps) {
	const socket: Socket = socketProps;
	const userData: IUser = JSON.parse(localStorage.getItem('user') || '{}');
	const room: IRoom = roomDataProps;
	const isPlayer: boolean = userData.id === room.paddleOne.user.id || userData.id === room.paddleTwo.user.id;
	const keyUpEvent = (event: KeyboardEvent) => {
		event.preventDefault();
		const keyData: IKey = {
			roomId: room.roomId,
			key: 'ArrowUp',
			nickname: userData.username,
		};
		socket.emit('keyUp', keyData);
	};

	const keyDownEvent = (event: KeyboardEvent) => {
		event.preventDefault();
		const keyData: IKey = {
			roomId: room.roomId,
			key: 'ArrowDown',
			nickname: userData.username,
		};
		socket.emit('keyDown', keyData);
	};
	useEffect(() => {
		const gameData = new GameData(socket, room);
		if (isPlayer) {
			window.addEventListener('keyup', keyUpEvent);
			window.addEventListener('keydown', keyDownEvent);
		}

		socket.on('updateRoom', (updatedRoom: string) => {
			const roomData: IRoom = JSON.parse(updatedRoom);
			gameData.setBallPosition(roomData.ball.x, roomData.ball.y);
			gameData.setLeftPaddlePosition(roomData.paddleOne.y);
			gameData.setRightPaddlePosition(roomData.paddleTwo.y);
		});
		gameData.startGame();
		return () => {
			if (isPlayer) {
				window.removeEventListener('keyup', keyUpEvent);
				window.removeEventListener('keydown', keyDownEvent);
			}
		};
	}, []);
	const leaveRoom = () => {
		socket.emit('leaveRoom');
	};
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
