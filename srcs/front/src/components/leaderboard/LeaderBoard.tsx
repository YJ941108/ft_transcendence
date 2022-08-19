import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
// import IUserData from '../../modules/Interfaces/userInterface';
// import UserInfo from '../chat/li-AllUser';
import { getUsersData } from '../../modules/api';
import IUserData from '../../modules/Interfaces/userInterface';

const LeaderBoardStyleC = styled.ul`
	background-color: black;
`;

const LeaderBoardUserStyleC = styled.li`
	list-style: none;
`;

function LeaderBoard() {
	function compareNumbers(a: IUserData, b: IUserData) {
		return b.ratio - a.ratio;
	}

	const { data: usersData } = useQuery<IUserData[]>('users', getUsersData);
	usersData?.sort(compareNumbers);
	return (
		<LeaderBoardStyleC>
			{usersData?.map((element: IUserData) => {
				return (
					<LeaderBoardUserStyleC>
						{element.nickname} {element.wins}승 {element.losses}패 {element.ratio}
					</LeaderBoardUserStyleC>
				);
			})}
		</LeaderBoardStyleC>
	);
}

export default LeaderBoard;
