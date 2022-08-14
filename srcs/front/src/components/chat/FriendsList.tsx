import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { Socket } from 'socket.io-client';
import { friendsList, requestList } from '../../modules/atoms';
import { IMyDataResponse } from '../../modules/Interfaces/chatInterface';
import IUserData from '../../modules/Interfaces/userInterface';
import FriendUserInfo from './li-FriendUser';
import RequestUserInfo from './li-RequestUser';

const FriendsListStyleC = styled.ul`
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

function FriendsList({ chatSocket }: ISocket) {
	const [requestUser, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [users, setUsers] = useRecoilState<IUserData[]>(friendsList);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningMe', (response: IMyDataResponse) => {
				setRequestUsers(response.data.friendsRequest);
				setUsers(response.data.friends);
				console.log(response, 'RESPONSE');
			});
			return () => {
				chatSocket.off('listeningMe');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<FriendsListStyleC>
			{requestUser?.map((element: IUserData) => {
				return (
					<RequestUserInfo
						key={element.id}
						id={element.id}
						nickname={element.nickname}
						photo={element.photo}
						chatSocket={chatSocket}
						isOnline={element.isOnline}
					/>
				);
			})}
			{users?.map((element: IUserData) => {
				return (
					<FriendUserInfo
						key={element.id}
						id={element.id}
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
