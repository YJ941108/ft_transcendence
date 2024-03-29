import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import styled from 'styled-components';
import PlayerInfo from '../chat/PlayerInfo';
import GameData from './GameData';
import { IRoom, IUser, IKey, GameState } from './GameInterfaces';

interface IGameScreenProps {
	socketProps: Socket;
	roomDataProps: any;
}

const LeaveRoomStyleC = styled.button`
	/* border: none; */
	/* border-bottom: 1px solid white; */
	height: 50px;
	width: 100%;
	/* background-color: black; */
	/* color: white; */
	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: white;
	}
`;

const Canvas = styled.canvas`
	width: 100%;
	box-sizing: border-box;
	border: 3px solid white;
`;

function GameScreen({ socketProps, roomDataProps }: IGameScreenProps) {
	const socket: Socket = socketProps;
	const userData: IUser = JSON.parse(localStorage.getItem('user') || '{}');
	let room: IRoom = roomDataProps;
	const isPlayer: boolean = userData.id === room.paddleOne.user.id || userData.id === room.paddleTwo.user.id;
	let animationFrameId: number;
	const keyUpEvent = (event: KeyboardEvent) => {
		const keyData: IKey = {
			roomId: room.roomId,
			key: event.key,
			id: userData.id,
		};
		socket.emit('keyUp', keyData);
	};

	const keyDownEvent = (event: KeyboardEvent) => {
		const keyData: IKey = {
			roomId: room.roomId,
			key: event.key,
			id: userData.id,
		};
		socket.emit('keyDown', keyData);
	};

	const drawGame = (gameData: GameData, roomData: IRoom) => {
		gameData.clear();

		gameData.drawNet();
		gameData.drawPaddle(roomData.paddleOne);
		gameData.drawPaddle(roomData.paddleTwo);
		gameData.drawBall(roomData.ball);
		gameData.drawScore(roomData.paddleOne, roomData.paddleTwo);
	};

	const gameEnd = (
		roomId: string,
		playerOneName: string,
		playerTwoName: string,
		gameState: GameState,
		gameData: GameData
	) => {
		if (gameState === GameState.PLAYER_ONE_WIN) {
			gameData.drawCenteredTexture(
				`${playerOneName} Won!!`,
				gameData.screenWidth / 2,
				gameData.screenHeight / 2,
				45,
				'white'
			);
		} else if (gameState === GameState.PLAYER_TWO_WIN)
			gameData.drawCenteredTexture(
				`${playerTwoName} Won!!`,
				gameData.screenWidth / 2,
				gameData.screenHeight / 2,
				45,
				'white'
			);
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
			if (room.gameState !== GameState.PLAYER_ONE_WIN && room.gameState !== GameState.PLAYER_TWO_WIN && isPlayer)
				socket.emit('requestUpdate', room.roomId);
			drawGame(gameData, room);
			if (room.gameState === GameState.WAITING) {
				gameData.drawWaiting();
			} else if (room.gameState === GameState.STARTING) {
				gameData.drawStartCountDown('READY');
			} else if (room.gameState === GameState.PAUSED) {
				gameData.drawPausedState();
			} else if (room.gameState === GameState.RESUMED) {
				gameData.drawStartCountDown('READY');
			} else if (room.gameState === GameState.PLAYER_ONE_WIN || room.gameState === GameState.PLAYER_TWO_WIN) {
				gameEnd(room.roomId, room.paddleOne.user.nickname, room.paddleTwo.user.nickname, room.gameState, gameData);
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
			<LeaveRoomStyleC onClick={leaveRoom} type="button">
				LEAVE ROOM
			</LeaveRoomStyleC>
			<Canvas id="pong-canvas" width="1920" height="1080" />
			<PlayerInfo leftPlayer={room.paddleOne} rightPlayer={room.paddleTwo} />
		</div>
	);
}

export default GameScreen;
