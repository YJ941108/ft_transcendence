import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import styled from 'styled-components';
import GameData from './GameData';
import { IRoom, IUser, IKey, GameState } from './GameInterfaces';

interface IGameScreenProps {
	socketProps: Socket;
	roomDataProps: any;
}

const Canvas = styled.canvas`
	width: 100%;
	box-sizing: border-box;
`;

function GameScreen({ socketProps, roomDataProps }: IGameScreenProps) {
	const countDown = ['3', '2', '1', 'start'];
	const socket: Socket = socketProps;
	const userData: IUser = JSON.parse(localStorage.getItem('user') || '{}');
	let room: IRoom = roomDataProps;
	const isPlayer: boolean = userData.id === room.paddleOne.user.id || userData.id === room.paddleTwo.user.id;
	let animationFrameId: number;
	const keyUpEvent = (event: KeyboardEvent) => {
		event.preventDefault();
		const keyData: IKey = {
			roomId: room.roomId,
			key: event.key,
			nickname: userData.username,
		};
		socket.emit('keyUp', keyData);
	};

	const keyDownEvent = (event: KeyboardEvent) => {
		event.preventDefault();
		const keyData: IKey = {
			roomId: room.roomId,
			key: event.key,
			nickname: userData.username,
		};
		socket.emit('keyDown', keyData);
	};

	const drawGame = (gameData: GameData, roomData: IRoom) => {
		gameData.clear();

		gameData.drawPaddle(roomData.paddleOne);
		gameData.drawPaddle(roomData.paddleTwo);
		gameData.drawBall(roomData.ball);
		gameData.drawScore(roomData.paddleOne, roomData.paddleTwo);
	};

	useEffect(() => {
		const gameData = new GameData(room);
		if (isPlayer) {
			window.addEventListener('keyup', keyUpEvent);
			window.addEventListener('keydown', keyDownEvent);
		}

		socket.on('updateRoom', (updatedRoom: string) => {
			const roomData: IRoom = JSON.parse(updatedRoom);
			room = roomData;
		});

		const gameLoop = () => {
			socket.emit('requestUpdate', room.roomId);
			drawGame(gameData, room);
			if (room.gameState === GameState.WAITING) {
				gameData.drawWaiting();
			}
			if (room.gameState === GameState.STARTING) {
				const count: number = Math.floor((Date.now() - room.timestampStart) / 1000);
				gameData.drawStartCountDown(countDown[count]);
			}
			animationFrameId = window.requestAnimationFrame(gameLoop);
		};

		gameLoop();

		return () => {
			if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
			if (isPlayer) {
				window.removeEventListener('keyup', keyUpEvent);
				window.removeEventListener('keydown', keyDownEvent);
			}
		};
	}, []);
	const leaveRoom = () => {
		socket.emit('leaveRoom', room.roomId);
	};
	return (
		<div>
			<Canvas id="pong-canvas" width="1920" height="1080">
				hello
			</Canvas>
			<button onClick={leaveRoom} type="button">
				leave room
			</button>
		</div>
	);
}

export default GameScreen;
