import React from 'react';
import MainBox from '../components/styles/box/MainBox';
import Navbar from '../components/ navbar/Navbar';
import ContentBox from '../components/styles/box/ContentBox';
import SideBox from '../components/styles/box/SideBox';

function LeaderboardPage() {
	return (
		<MainBox>
			<Navbar />
			<ContentBox>
				<h1>Leaderboard</h1>
			</ContentBox>
			<SideBox />
		</MainBox>
	);
}

export default LeaderboardPage;
