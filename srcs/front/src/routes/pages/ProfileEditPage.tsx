import React from 'react';
import { Navigate } from 'react-router-dom';
import MainBox from '../../components/styles/box/MainBox';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import SideBox from '../../components/styles/box/SideBox';
import isAdmin from '../../modules/login/isAdmin';

function ProfileEditPage() {
	if (!isAdmin()) return <Navigate to="/login" />;
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<form>
					{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
					<label>
						Profile Image :
						<input type="text" name="name" />
					</label>
					{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
					<label>
						NickName :
						<input type="text" name="name" />
					</label>
					<input type="submit" value="Submit" />
				</form>
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default ProfileEditPage;
