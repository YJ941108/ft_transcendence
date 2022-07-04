import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SideBox from '../styles/SideBox';

const NavbarC = styled.div`
	text-transform: uppercase;
`;

function Navbar() {
	return (
		<SideBox>
			<NavbarC>
				<Link to="/game">play</Link>
				<Link to="/profile">profile</Link>
				<Link to="/friends">friends</Link>
				<Link to="/leaderboard">leaderboard</Link>
			</NavbarC>
		</SideBox>
	);
}

export default Navbar;
