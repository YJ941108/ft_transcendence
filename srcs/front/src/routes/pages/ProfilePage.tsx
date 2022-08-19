import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import ProfileCard from '../../components/profile/ProfileCard';
import isAdmin from '../../modules/login/isAdmin';
import ProfileContent from '../../components/profile/ProfileContent';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';

const ProfileDiv = styled.div`
	display: grid;
	padding: 30px;
	width: 100%;
	height: 100%;
	//grid-template-rows: 300px 1fr;
	grid-template-columns: 1fr 4fr;
	grid-template-areas: 'ProfileCard ProfileContent';
	grid-gap: 10px;
`;

function ProfilePage() {
	if (!isAdmin()) return <Navigate to="/login" />;
	return (
		<>
			<Navbar />
			<ContentBox>
				<ProfileDiv>
					<ProfileCard />
					<ProfileContent />
				</ProfileDiv>
			</ContentBox>
		</>
	);
}

export default ProfilePage;
