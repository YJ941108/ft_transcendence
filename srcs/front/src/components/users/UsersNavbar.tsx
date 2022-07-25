import React from 'react';
import { Link } from 'react-router-dom';

function UsersNavbar() {
	return (
		<div>
			<Link to="/users/userlist">Users</Link>
			<Link to="/users/friendlist">Friends</Link>
		</div>
	);
}

export default UsersNavbar;
