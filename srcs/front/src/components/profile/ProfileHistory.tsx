import React from 'react';
import styled from 'styled-components';

type Props = {
	wins: number | undefined;
	losses: number | undefined;
	ratio: number | undefined;
};

const ProfileHistoryBox = styled.div`
	width: 100%;
	display: grid;
	grid-template-areas:
		'title title title'
		'winDiv loseDiv ratioDiv';
	padding: 2rem;
`;

function ProfileHistory({ wins, losses, ratio }: Props) {
	return (
		<ProfileHistoryBox>
			<div className="contentTitle">MY GAME HISTORY</div>
			<div className="myContentBox" id="win">
				<img src="/img/win.png" alt="winIcon" />
				<span>{wins}</span>
			</div>
			<div className="myContentBox" id="loss">
				<img src="/img/loss.png" alt="lossIcon" />
				<span>{losses}</span>
			</div>
			<div className="myContentBox" id="ratio">
				<img src="/img/ratio.png" alt="ratioIcon" />
				<span>{ratio}</span>
			</div>
		</ProfileHistoryBox>
	);
}

export default ProfileHistory;
