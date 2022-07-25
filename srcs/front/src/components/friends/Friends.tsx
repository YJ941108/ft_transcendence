import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getFriendsListData } from '../../modules/api';

interface IFriend {
	id: number;
	username: string;
	email: string;
	nickname: string;
	photo: string;
	accessToken: null;
	refreshToken: null;
	jwt: null;
	tfa: false;
	tfaCode: string;
	wins: null;
	losses: null;
	ratio: null;
	createdAt: string;
	updatedAt: string;
}

const FriendsList = styled.ul`
	li {
		width: 100%;
		height: 5rem;

		img {
			width: 5rem;
			height: 5rem;
		}
	}
`;

function Friends() {
	const { isLoading, data: friendsList, error } = useQuery<IFriend[]>('friends', getFriendsListData);

	if (isLoading) return <h1>Loading</h1>;
	if (error) return <div>hello</div>;
	return (
		<div>
			<FriendsList>
				{friendsList?.map((friend) => {
					return (
						<li key={friend?.id}>
							<img alt="FriendPhoto" src={friend?.photo} />
							<span>{friend?.nickname}</span>
						</li>
					);
				})}
			</FriendsList>
		</div>
	);
}

export default Friends;
