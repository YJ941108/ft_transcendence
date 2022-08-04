import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { Socket } from 'socket.io-client';
import UserInfo from './UserInfo';
import { friendsList, requestList } from '../../modules/atoms';
import { IFriendsList } from '../../modules/Interfaces/chatInterface';
import IUserData from '../../modules/Interfaces/userInterface';

interface IDebug {
	func: string;
	code: number;
	message: string;
}

const FriendsListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 50%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
`;

interface ISocket {
	chatSocket: Socket;
}

function FriendsList({ chatSocket }: ISocket) {
	const [users, setUsers] = useRecoilState<IUserData[]>(friendsList);
	const [requestUser, setRequestUsers] = useRecoilState<IUserData[]>(requestList);

	useEffect(() => {
		chatSocket.emit('getFriends', (response: IDebug) => {
			console.log(response);
		});
	}, []);

	useEffect(() => {
		if (chatSocket)
			chatSocket.on('listeningFriends', (response: IFriendsList) => {
				setUsers(response.data.friends);
				setRequestUsers(response.data.friendsRequest);
				console.log(response, 'RESPONSE');
			});
		return () => {
			chatSocket.off('listeningFriends');
		};
	}, [chatSocket]);

	return (
		<FriendsListStyleC>
			{requestUser?.map((element: IUserData) => {
				return (
					<UserInfo
						key={element.id}
						nickname={element.nickname}
						photo={element.photo}
						chatSocket={chatSocket}
						isOnline={element.isOnline}
					/>
				);
			})}
			{users?.map((element: IUserData) => {
				return (
					<UserInfo
						key={element.id}
						nickname={element.nickname}
						photo={element.photo}
						chatSocket={chatSocket}
						isOnline={element.isOnline}
					/>
				);
			})}
		</FriendsListStyleC>
	);
}

export default FriendsList;
