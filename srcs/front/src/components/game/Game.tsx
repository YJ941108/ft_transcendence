import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, IUser, IRoom } from './GameInterfaces';
import GameScreen from './GameScreen';
import GameRooms from './GameRooms';

let socket: Socket;

function Game() {
	const [isDisplayGame, setIsDisplayGame] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	const [queue, setQueue] = useState(false);
	const [gameRooms, setGameRooms] = useState<IRoom[]>([]);
	const userData: IUser = JSON.parse(localStorage.getItem('user') || '{}');
	const joinQueue = (event: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit('joinQueue', event.currentTarget.value);
	};

	const leaveQueue = () => {
		socket.emit('leaveQueue');
	};

	const updateCurrentGames = (currentGameRooms: IRoom[]) => {
		setGameRooms(() => {
			return [...currentGameRooms];
		});
	};
	useEffect(() => {
		socket = io('http://3.39.20.24:3032/api/games');
		socket = socket.on('connect', () => {
			socket.emit('handleUserConnect', userData);
			socket.emit('getCurrentGames');
		});
		socket.on('updateCurrentGames', (currentGamesData: IRoom[]) => {
			updateCurrentGames(currentGamesData);
		});
		socket.on('newRoom', (newRoomData: IRoom) => {
			if (GameState.WAITING !== newRoomData.gameState || userData?.nickname !== newRoomData.paddleOne.user.nickname)
				socket.emit('joinRoom', newRoomData.roomId);
			setRoom(newRoomData);
			setQueue(false);
		});
		socket.on('joinedQueue', () => {
			setQueue(true);
		});
		socket.on('leavedQueue', () => {
			setQueue(false);
			setRoom(null);
		});
		socket.on('joinedRoom', () => {
			setIsDisplayGame(true);
		});
		socket.on('leavedRoom', () => {
			setIsDisplayGame(false);
		});
		return () => {
			if (socket) socket.disconnect();
			setGameRooms([]);
		};
	}, []);
	return (
		<div>
			<h1>GAME</h1>
			{isDisplayGame ? (
				<GameScreen socketProps={socket} roomDataProps={room} />
			) : (
				<>
					{queue ? (
						<button type="button" onClick={leaveQueue}>
							leaveQueue
						</button>
					) : (
						<button type="button" onClick={joinQueue} value="DEFAULT">
							joinQueue
						</button>
					)}
					<GameRooms gameRooms={gameRooms} socket={socket} />
				</>
			)}
		</div>
	);
}

export default Game;
