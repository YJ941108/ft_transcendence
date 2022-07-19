import React, { useEffect, useState } from 'react';
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
	const [room, setRoom] = useState<IRoom>(roomDataProps);
	const isPlayer: boolean = userData.id === room.paddleOne.user.id || userData.id === room.paddleTwo.user.id;
	let animationFrameId: number;
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

	const drawGame = (gameData: GameData, roomData: IRoom) => {
		gameData.clear();

		gameData.drawPaddle(roomData.paddleOne);
		gameData.drawPaddle(roomData.paddleTwo);
		gameData.drawBall(roomData.ball);
	};

	useEffect(() => {
		const gameData = new GameData(room);
		if (isPlayer) {
			window.addEventListener('keyup', keyUpEvent);
			window.addEventListener('keydown', keyDownEvent);
		}

		socket.on('updateRoom', (updatedRoom: string) => {
			const roomData: IRoom = JSON.parse(updatedRoom);
			setRoom(roomData);
		});

		const gameLoop = () => {
			socket.emit('requestUpdate', room.roomId);
			drawGame(gameData, room);
			animationFrameId = window.requestAnimationFrame(gameLoop);
		};

		window.requestAnimationFrame(gameLoop);

		return () => {
			if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
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
			<canvas id="pong-canvas" />
			<button onClick={leaveRoom} type="button">
				leave room
			</button>
		</div>
	);
}

export default GameScreen;
