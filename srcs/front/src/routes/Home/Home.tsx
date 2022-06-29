import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeC = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 10rem;
`;

const HeaderC = styled.header`
	font-size: 5em;
	margin-bottom: 6rem;
`;

const LoginC = styled.div`
	width: 7rem;
	height: 3.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 0.5rem;
	background-color: ${(props) => props.theme.backgroundColor};
	color: ${(props) => props.theme.textColor};
	font-size: 2em;
	padding: 0.5re;
	cursor: pointer;
	&:hover {
		background-color: ${(props) => props.theme.accentColor};
	}
`;

function Home() {
	return (
		<HomeC>
			<HeaderC>PONG</HeaderC>
			<LoginC>
				<Link to="/login">Login</Link>
			</LoginC>
		</HomeC>
	);
}

export default Home;
