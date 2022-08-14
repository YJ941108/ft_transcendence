import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import MainBox from '../../components/styles/box/MainBox';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import SideBox from '../../components/styles/box/SideBox';
import isAdmin from '../../modules/login/isAdmin';
import UsersNavbar from '../../components/users/UsersNavbar';
import Friends from '../../components/users/Friends';
import Users from '../../components/users/Users';

function UsersPage() {
	if (!isAdmin()) return <Navigate to="/login" />;
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<UsersNavbar />
				<Route path="/userlist" element={<Users />} />
				<Route path="/friendslist" element={<Friends />} />
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default UsersPage;
