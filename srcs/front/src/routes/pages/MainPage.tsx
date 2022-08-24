import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import isAdmin from '../../modules/login/isAdmin';
import MainBox from '../../components/styles/box/MainBox';
import SideBox from '../../components/styles/box/SideBox';

function MainPage() {
	if (!isAdmin()) return <Navigate to="/" />;
	return (
		<MainBox>
			<Outlet />
			<SideBox />
		</MainBox>
	);
}

export default MainPage;
