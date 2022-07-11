import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import getUserData from '../../modules/api';

const ProfileBox = styled.div`
	display: flex;
	flex-direction: column;
	img {
		width: 100px;
		height: 100px;
	}
	h1 {
		margin: 4rem;
		font-size: 50px;
	}
`;

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

function Profile() {
	const { isLoading, data } = useQuery<IUser>('user', getUserData);

	if (isLoading) return null;
	return (
		<ProfileBox>
			<img src={data?.photo} alt="profile" />
			<h1>{data?.nickname}</h1>
		</ProfileBox>
	);
}

export default Profile;
