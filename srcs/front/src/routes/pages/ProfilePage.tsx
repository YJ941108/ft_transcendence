import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import ProfileCard from '../../components/profile/ProfileCard';
import isAdmin from '../../modules/login/isAdmin';
import ProfileContent from '../../components/profile/ProfileContent';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import { IUser } from '../../components/profile/UserInterface';
import { getUserData } from '../../modules/api';

const ProfileDiv = styled.div`
	display: grid;
	padding: 30px;
	width: 100%;
	height: 100%;
	grid-template-columns: 1fr 4fr;
	grid-template-areas: '
	ProfileCard ProfileContent';
	grid-gap: 10px;
`;

function ProfilePage() {
	const { isLoading, data } = useQuery<IUser>('me', getUserData);
	if (!isAdmin()) return <Navigate to="/" />;
	if (isLoading) return null;

	return (
		<>
			<Navbar />
			<ContentBox>
				<ProfileDiv>
					<ProfileCard data={data} show={false} />
					<ProfileContent data={data} />
				</ProfileDiv>
			</ContentBox>
		</>
	);
}

export default ProfilePage;
