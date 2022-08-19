import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface INavbarListProps {
	current: boolean;
}

const NavbarC = styled.ul`
	text-transform: uppercase;
	border-right: 2px solid ${(props) => props.theme.textColor};
	height: 100vh;
	padding: 4rem;
`;

const NavbarListC = styled.li<INavbarListProps>`
	margin-bottom: 4rem;
	a {
		font-size: 1.5em;
		color: ${(props) => (props.current ? props.theme.accentColor : props.theme.textColor)};
	}
`;

function Navbar() {
	const [url, setUrl] = useState<string | undefined>('');
	useEffect(() => {
		console.log(window.location);
		setUrl(window.location.href.split('/').pop());
	}, [window.location]);
	return (
		<NavbarC>
			<NavbarListC current={url === 'game'}>
				<Link to="/main/game">play</Link>
			</NavbarListC>
			<NavbarListC current={url === 'profile'}>
				<Link to="/main/profile">profile</Link>
			</NavbarListC>
			<NavbarListC current={url === 'leaderboard'}>
				<Link to="/main/leaderboard">leaderboard</Link>
			</NavbarListC>
		</NavbarC>
	);
}

// 현재 페이지와 Link가 맞으면 그 Link의 색을 바꾼다.

export default Navbar;
