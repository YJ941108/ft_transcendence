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
import ListSection from './ListSection';

const FriendsListStyleC = styled.ul`
	min-height: 800px;
	max-height: 800px;
	overflow-y: scroll;
	background-color: black;
`;

function FriendsList() {
	const chatSocket = useChatSocket();
	const [requestUser, setRequestUsers] = useRecoilState<IUserData[]>(requestList);
	const [friendUsers, setFriendUsers] = useRecoilState<IUserData[]>(friendsList);
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
				setFriendUsers(response.data.friends);
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
			<ListSection title="REQUEST" />
			{requestUser?.map((element: IUserData) => {
				return <RequestUserInfo key={element.id} user={element} />;
			})}
			<ListSection title="FRIENDS" />
			{friendUsers?.map((element: IUserData) => {
				return <FriendUserInfo key={element.id} user={element} />;
			})}
			<ListSection title="BLOCK" />
			{blockedUsers?.map((element: IUserData) => {
				return <BlockedUserInfo key={element.id} user={element} />;
			})}
		</FriendsListStyleC>
	);
}

export default FriendsList;
