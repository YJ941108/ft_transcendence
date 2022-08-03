import React, { useState, useEffect } from 'react';
// import React from 'react';
import styled from 'styled-components';
// import { useQuery } from 'react-query';
import { io, Socket } from 'socket.io-client';
import { getUserData } from '../../modules/api';
import UserInfo from './UserInfo';

let socket: Socket;

const UserListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 92%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
`;

function UserList() {
	const [users, setUsers] = useState<string[]>([]);

	useEffect(() => {
		socket = io('http://3.39.20.24:3032/api/chat');
		socket = socket.on('connect', async () => {
			const userData = await getUserData();
			socket.emit('joinChat', { id: userData.id, nickname: userData.nickname });
			socket.emit('getUsers', (response: { data: Array<string> }) => {
				setUsers(response.data);
			});
		});
	}, []);

	return (
		<UserListStyleC>
			{users?.map((element: any) => {
				return <UserInfo key={element.id} nickname={element.nickname} photo={element.photo} />;
			})}
		</UserListStyleC>
	);
}

export default UserList;
