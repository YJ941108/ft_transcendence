import React from 'react';
import MainBox from '../../components/styles/box/MainBox';
import Navbar from '../../components/ navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import SideBox from '../../components/styles/box/SideBox';
import Profile from '../../components/profile/Profile';

function ProfilePage() {
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<Profile />
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default ProfilePage;
