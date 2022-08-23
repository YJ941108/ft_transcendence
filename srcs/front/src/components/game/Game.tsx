import React, { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { useQuery } from 'react-query';
import { GameState, IRoom } from './GameInterfaces';
import GameScreen from './GameScreen';
import GameRooms from './GameRooms';
import { IMyData } from '../../modules/Interfaces/chatInterface';
import { getUserData } from '../../modules/api';

let socket: Socket;

function Game() {
	const [isDisplayGame, setIsDisplayGame] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	const [queue, setQueue] = useState(false);
	const [gameRooms, setGameRooms] = useState<IRoom[]>([]);
	const { isLoading, data: userData, error } = useQuery<IMyData>('me', getUserData);
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
		if (isLoading || !userData || error) return () => {};
		socket = io('http://3.39.20.24:3032/api/games');
		socket = socket.on('connect', () => {
			socket.emit('handleUserConnect', userData);
			socket.emit('getCurrentGames');
		});
		socket.on('updateCurrentGames', (currentGamesData: IRoom[]) => {
			updateCurrentGames(currentGamesData);
		});
		socket.on('newRoom', (newRoomData: IRoom) => {
			if (newRoomData.gameState === GameState.WAITING && userData.nickname !== newRoomData.paddleOne.user.nickname) {
				return;
			}
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
			if (socket) {
				socket.off('updateCurrentGames');
				socket.off('newRoom');
				socket.off('joinedQueue');
				socket.off('leavedQueue');
				socket.off('joinedRoom');
				socket.off('leavedRoom');
				socket.disconnect();
			}
			setGameRooms([]);
		};
	}, [userData]);
	if (isLoading || error) return null;
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
						<div>
							<button type="button" onClick={joinQueue} value="DEFAULT">
								DEFAULT
							</button>
							<button type="button" onClick={joinQueue} value="BIG">
								ACTIVE
							</button>
						</div>
					)}
					<GameRooms gameRooms={gameRooms} socket={socket} />
				</>
			)}
		</div>
	);
}

export default Game;
