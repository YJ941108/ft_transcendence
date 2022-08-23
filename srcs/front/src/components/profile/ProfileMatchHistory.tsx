import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getGameMatchHistory } from '../../modules/api';
import { IMatch } from '../../modules/Interfaces/gameMatchInterface';
import '../styles/matchHistory.css';

type Props = {
	id: number;
};

const ProfileHistoryBox = styled.div`
	width: 100%;
	display: grid;
	grid-template-areas:
		'title title title'
		'matchDiv matchDiv matchDiv';
	grid-gap: 1rem;
	padding: 2rem;
`;

const GameMatchBox = styled.div`
	grid-area: matchDiv;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(2, 1fr);
	text-align: center;
	grid-gap: 1rem;
	place-items: center;
`;

const InnerDiv = styled.div`
	border: 1px dashed white;
	width: 100%;
	border-radius: 10px;
	padding: 0.5rem;
	display: grid;
	place-items: center;
	grid-template-areas:
		'matchImgA vs matchImgB'
		'matchNicknameA . matchNicknameB';
`;

function ProfileMatchHistory({ id }: Props) {
	const { data: matches } = useQuery<IMatch[]>(['matchHistory', id], () => getGameMatchHistory(id));
	const matchImgList = matches?.slice(0, 6).map((match) => (
		<InnerDiv key={match.id}>
			<div className="matchImgDiv">
				<img src={match.winner.photo} alt="winner" className="matchImg" id="matchImgA" />
			</div>
			<span className="innerSpan" id="matchNameA">
				{match.winner.nickname}
			</span>
			<p id="vs">VS</p>
			<div className="matchImgDiv">
				<img src={match.loser.photo} alt="loser" className="matchImg" id="matchImgB" />
			</div>
			<span className="innerSpan" id="matchNameB">
				{match.loser.nickname}
			</span>
		</InnerDiv>
	));
	return (
		<ProfileHistoryBox>
			<div className="contentTitle">MY GAME MATCH HISTORY</div>
			<GameMatchBox>{matchImgList}</GameMatchBox>
		</ProfileHistoryBox>
	);
}

export default ProfileMatchHistory;
