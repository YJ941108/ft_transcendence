import React from 'react';
import { Navigate } from 'react-router-dom';
import MainBox from '../../components/styles/box/MainBox';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import SideBox from '../../components/styles/box/SideBox';
import isAdmin from '../../modules/login/isAdmin';
import UsersNavbar from '../../components/users/UsersNavbar';
import Friends from '../../components/users/Friends';

function FriendsPage() {
	if (!isAdmin()) return <Navigate to="/login" />;
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<UsersNavbar />
				<Friends />
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default FriendsPage;
