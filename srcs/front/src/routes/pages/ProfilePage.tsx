import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import MainBox from '../../components/styles/box/MainBox';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import SideBox from '../../components/styles/box/SideBox';
import ProfileCard from '../../components/profile/ProfileCard';
import isAdmin from '../../modules/login/isAdmin';
import ProfileContent from '../../components/profile/ProfileContent';

const ProfileDiv = styled.div`
	display: grid;
	padding: 30px;
	width: 100%;
	height: 100%;
	grid-template-columns: 1fr 4fr;
	grid-template-areas: 'ProfileCard ProfileContent';
	grid-gap: 10px;
`;

function ProfilePage() {
	if (!isAdmin()) return <Navigate to="/login" />;
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<ProfileDiv>
					<ProfileCard />
					<ProfileContent />
				</ProfileDiv>
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default ProfilePage;
