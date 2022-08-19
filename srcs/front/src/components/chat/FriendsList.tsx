import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { friendsList, requestList, blockedList } from '../../modules/atoms';
import { IMyDataResponse } from '../../modules/Interfaces/chatInterface';
import IUserData from '../../modules/Interfaces/userInterface';
import FriendUserInfo from './li-FriendUser';
import RequestUserInfo from './li-RequestUser';
import BlockedUserInfo from './li-BlockedUser';
import { useChatSocket } from './SocketContext';

const SectionTitleStyleC = styled.li`
	background-color: rgba(255, 255, 255, 0.1);
	margin: 3px 0;
	/* border: 1px solid rgba(255, 255, 255, 0.5); */
`;

const FriendsListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 70%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
`;

function FriendsList() {
	const chatSocket = useChatSocket();
	const [requestUser, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [users, setUsers] = useRecoilState<IUserData[]>(friendsList);
	const [blockedUsers, setBlockedUsers] = useRecoilState<IUserData[]>(blockedList);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.emit('requestMyData');
		}
	}, []);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningMe', (response: IMyDataResponse) => {
				setRequestUsers(response.data.friendsRequest);
				setUsers(response.data.friends);
				setBlockedUsers(response.data.blockedUsers);
				console.log(response.data);
			});
			return () => {
				chatSocket.off('listeningMe');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<FriendsListStyleC>
			<SectionTitleStyleC>request</SectionTitleStyleC>
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
			<SectionTitleStyleC>friends</SectionTitleStyleC>
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
			<SectionTitleStyleC>block</SectionTitleStyleC>
			{blockedUsers?.map((element: IUserData) => {
				return (
					<BlockedUserInfo
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
