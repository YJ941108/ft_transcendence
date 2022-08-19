import React from 'react';
import Game from '../../components/game/Game';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';

function GamePage() {
	return (
		<>
			<Navbar />
			<ContentBox>
				<Game />
			</ContentBox>
		</>
	);
}

export default GamePage;
