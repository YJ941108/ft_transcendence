import React from 'react';
import Navbar from '../../components/navbar/Navbar';
import ContentBox from '../../components/styles/box/ContentBox';
import LeaderBoard from '../../components/leaderboard/LeaderBoard';

function LeaderboardPage() {
	return (
		<>
			<Navbar />
			<ContentBox>
				<LeaderBoard />
			</ContentBox>
		</>
	);
}

export default LeaderboardPage;
