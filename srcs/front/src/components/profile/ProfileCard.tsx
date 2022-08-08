import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import Toggle from './Toggle';
import getUserData from '../../modules/api';
import ProfileModal from './ProfileModal';

const RootStyled = styled.div`
	grid-area: ProfileCard;
	height: 100%;
	a {
		display: block;
		padding: 20px;
		margin-top: 20px;
		cursor: pointer;
	}
`;

const ProfileCardBox = styled.div`
	border: 1px solid white;
	display: inline-block;
	color: white;
	padding: 20px;
	height: 250px;
	width: 188px;
	border-radius: 10px;
	text-align: center;
	cursor: default;
	h1 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
		font-size: 1.2rem;
		margin-top: 20px;
	}
	img {
		object-fit: cover;
		border-radius: 50%;
		width: 150px;
		height: 150px;
		margin-bottom: 0.4rem;
		background-color: var(--white);
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
	tfa: boolean;
	id: number;
	jwt: string;
	refresh_token: string;
}

function ProfileCard() {
	const { isLoading, data, error } = useQuery<IUser>('user', getUserData);

	if (isLoading) return null;
	if (error) return null;
	return (
		<RootStyled>
			<ProfileCardBox>
				<img src={data?.photo} alt="profile" />
				<h1>{data?.nickname}</h1>
				<ProfileModal />
				<Link to="/ProfileEdit">USER EDIT</Link>
			</ProfileCardBox>
			<Toggle tfa={data?.tfa} />
		</RootStyled>
	);
}

export default ProfileCard;
