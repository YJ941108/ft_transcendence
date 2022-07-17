import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, IUser, IRoom } from './GameInterfaces';
import GameScreen from './GameScreen';

let socket: Socket;

function Game() {
	const [isDisplayGame, setIsDisplayGame] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	const [queue, setQueue] = useState(false);
	const [games, setGames] = useState<IRoom[]>([]);
	const userData: IUser = JSON.parse(localStorage.getItem('user') || '{}');
	const joinQueue = (event: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit('joinQueue', event.currentTarget.value);
	};

	const leaveQueue = () => {
		socket.emit('leaveQueue');
	};

	const updateCurrentGames = (currentGamesData: IRoom[]) => {
		setGames(() => {
			return [...currentGamesData];
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
			if (GameState.WAITING !== newRoomData.gameState || userData.username !== newRoomData.paddleOne.user.username)
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
			setGames([]);
		};
	}, []);
	return (
		<div>
			<h1>GAME</h1>
			{isDisplayGame && room ? <GameScreen socketProps={socket} roomDataProps={room} /> : null}
			{queue ? (
				<button type="button" onClick={leaveQueue}>
					leaveQueue
				</button>
			) : (
				<button type="button" onClick={joinQueue} value="default">
					joinQueue
				</button>
			)}
			<ul>
				{games.map((game: IRoom) => (
					<li key={game.roomId}>{game?.roomId}</li>
				))}
			</ul>
		</div>
	);
}

export default Game;
