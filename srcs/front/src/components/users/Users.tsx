import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getUserListData, getUserData } from '../../modules/api';

interface IUsers {
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

interface IUser {
	access_token: string;
	created_at: string;
	email: string;
	nickname: string;
	photo: string;
	updated_at: string;
	username: string;
	friends: number[];
	friends_blocked: number[];
	friends_request: number[];
	id: number;
	jwt: string;
	refresh_token: string;
}

const UserListC = styled.ul`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	li {
		width: 80%;
		display: grid;
		grid-template-rows: repeat(1, 100px);
		grid-template-columns: 100px 0.8fr;
		column-gap: 1rem;
		margin-bottom: 1rem;
		img {
			width: 6rem;
			height: 6rem;
		}
	}
`;

function Users() {
	const {
		isLoading: isUserListLoading,
		data: UserList,
		error: UserListError,
	} = useQuery<IUsers[]>('users', getUserListData);
	const { isLoading: isUserDataLoading, data: userData, error: userDataError } = useQuery<IUser>('user', getUserData);
	if (isUserListLoading || isUserDataLoading) return <h1>Loading</h1>;
	if (UserListError || userDataError) return <div>Error</div>;
	return (
		<div>
			<UserListC>
				{UserList?.map((user) => {
					if (userData?.id !== user.id) {
						return (
							<li key={user?.id}>
								<img alt="UserPhoto" src={user?.photo} />
								<div>
									<span>{user?.nickname}</span>
								</div>
							</li>
						);
					}
					return null;
				})}
			</UserListC>
		</div>
	);
}

export default Users;
