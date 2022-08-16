import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Socket } from 'socket.io-client';
import UserInfo from './li-AllUser';
import { chatUserList, MyInfo } from '../../modules/atoms';
import IUserData from '../../modules/Interfaces/userInterface';

const UserListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 70%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
`;

interface ISocket {
	chatSocket: Socket;
}

function UserList({ chatSocket }: ISocket) {
	const [users, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const info = useRecoilValue(MyInfo);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningGetUsers', (response: { data: IUserData[] }) => {
				console.log(response, 'listeningGetUsers');
				setUsers(response.data);
			});
			return () => {
				chatSocket.off('listeningGetUsers');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<UserListStyleC>
			{users?.map((element: IUserData) => {
				if (element.id !== info.id) {
					return (
						<UserInfo
							key={element.id}
							id={element.id}
							nickname={element.nickname}
							photo={element.photo}
							chatSocket={chatSocket}
							isOnline={element.isOnline}
						/>
					);
				}
				return null;
			})}
		</UserListStyleC>
	);
}

export default UserList;
