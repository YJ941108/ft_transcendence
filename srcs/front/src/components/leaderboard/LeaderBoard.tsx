import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
// import IUserData from '../../modules/Interfaces/userInterface';
// import UserInfo from '../chat/li-AllUser';
import { getUsersData } from '../../modules/api';
import IUserData from '../../modules/Interfaces/userInterface';
import LeaderBoardUserInfo from './LeaderBoardUserInfo';

const TitleDivStyleC = styled.div`
	height: 5rem;
	text-align: center;
	margin: 1rem;
`;

const TitlePStyleC = styled.p`
	margin: auto;
	font-size: 2rem;
`;

const LeaderBoardStyleC = styled.ul`
	background-color: black;
`;

const LeaderBoardUserStyleC = styled.li`
	list-style: none;
	display: flex;
	max-width: 100%;
	justify-content: space-between;
	/* border: 1px solid white; */
	padding: 5px;
	margin: 5px;
`;

function LeaderBoard() {
	function compareNumbers(a: IUserData, b: IUserData) {
		return b.ratio - a.ratio;
	}

	const { data: usersData } = useQuery<IUserData[]>('users', getUsersData);
	usersData?.sort(compareNumbers);
	return (
		<LeaderBoardStyleC>
			<TitleDivStyleC>
				<TitlePStyleC>LEADERBOARD</TitlePStyleC>
			</TitleDivStyleC>
			{usersData?.map((element: IUserData, index: number) => {
				return (
					<LeaderBoardUserStyleC>
						{index}. <LeaderBoardUserInfo key={element.id} user={element} />
					</LeaderBoardUserStyleC>
				);
			})}
		</LeaderBoardStyleC>
	);
}

export default LeaderBoard;
