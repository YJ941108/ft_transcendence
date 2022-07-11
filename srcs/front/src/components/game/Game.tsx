import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

// interface IUser {
// 	id: number;
// 	username: string;
// }

// interface IPlayer {
// 	user: IUser;
// 	x: number;
// 	y: number;
// 	width: number;
// 	height: number;
// 	goal: number;
// 	color: string;
// }

// interface IBall {
// 	x: number;
// 	y: number;
// 	r: number;
// 	color: string;
// }

// interface IRoom {
// 	roomId: string;
// 	playerOne: IPlayer;
// 	playerTwo: IPlayer;
// 	ball: IBall;
// 	timestampStart: number;
// 	goalTimestamp: number;
// 	pauseTime: { pause: number; resume: number }[];
// 	winner: string;
// 	loser: string;
// 	timer: number;
// 	gameDuration: number;
// }

function Game() {
	const [queue, setQueue] = useState(false);
	const joinQueue = () => {
		setQueue(true);
		console.log(queue);
	};

	const leaveQueue = () => {
		setQueue(false);
	};

	// const updateCurrentGames = (currentGamesData: IRoom[]) => {
	// 	console.log(currentGamesData);
	// };
	useEffect(() => {
		socket = io('http://3.39.20.24:3032/api/game');

		socket = socket.on('connect', () => {
			socket.emit('handleUserConnect');
			socket.emit('getCurrentGames');
		});
		// socket.on('updateCurrentGames', (currentGamesData: IRoom[]) => {
		// 	updateCurrentGames(currentGamesData);
		// });
		// socket.on('newRoom', (newRoomData: IRoom) => {
		// 	socket.emit('joinRoom', newRoomData.roomId);
		// });
		// socket.on('joinedQueue', () => {
		// 	setQueue(true);
		// });
		// socket.on('leavedQueue', () => {
		// 	setQueue(false);
		// });
		// socket.on('joinedRoom', () => {
		// 	console.log('Joined Game');
		// });
		// socket.on('leavedRoom', () => {
		// 	console.log('Leaved Game');
		// });
		return () => {
			if (socket) socket.disconnect();
		};
	}, []);
	return (
		<div>
			<h1>GAME</h1>
			{queue ? (
				<button type="button" onClick={joinQueue}>
					joinQueue
				</button>
			) : (
				<button type="button" onClick={leaveQueue}>
					leaveQueue
				</button>
			)}
		</div>
	);
}

export default Game;
