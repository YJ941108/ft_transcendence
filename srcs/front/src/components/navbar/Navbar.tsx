import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface INavbarListProps {
	current: boolean;
}

const NavbarC = styled.ul`
	text-transform: uppercase;
	border-right: 2px solid ${(props) => props.theme.textColor};
	/* height: 100vh; */
	padding: 5rem 3rem;
	font-family: RetroGaming, serif;
`;

const NavbarListC = styled.li<INavbarListProps>`
	margin-bottom: 4rem;
	a {
		font-size: 1.2em;
		color: ${(props) => (props.current ? props.theme.accentColor : props.theme.textColor)};
	}
`;

function Navbar() {
	const url = window.location.href.split('/').pop();
	return (
		<NavbarC>
			<NavbarListC current={url === 'game'}>
				<Link to="/main/game">PLAY</Link>
			</NavbarListC>
			<NavbarListC current={url === 'profile'}>
				<Link to="/main/profile">PROFILE</Link>
			</NavbarListC>
			<NavbarListC current={url === 'leaderboard'}>
				<Link to="/main/leaderboard">LEADERBOARD</Link>
			</NavbarListC>
		</NavbarC>
	);
}

// 현재 페이지와 Link가 맞으면 그 Link의 색을 바꾼다.

export default Navbar;
