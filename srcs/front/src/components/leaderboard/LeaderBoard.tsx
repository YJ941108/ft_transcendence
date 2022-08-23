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
	display: flex;
	justify-content: space-between;
	/* border: 1px solid white; */
	padding: 5px;
	margin: 5px;
`;

const UserNameStyleC = styled.span`
	/* width: 10px; */
	/* background-color: red; */
	overflow: hidden;
	text-overflow: ellipsis;
`;

function LeaderBoard() {
	function compareNumbers(a: IUserData, b: IUserData) {
		return b.ratio - a.ratio;
	}

	const { data: usersData } = useQuery<IUserData[]>('users', getUsersData);
	usersData?.sort(compareNumbers);
	return (
		<LeaderBoardStyleC>
			{usersData?.map((element: IUserData, index: number) => {
				return (
					<LeaderBoardUserStyleC>
						<UserNameStyleC>
							#{index}. {element.nickname}
						</UserNameStyleC>
						<UserNameStyleC>
							{element.wins}W {element.losses}L {element.ratio}pts
						</UserNameStyleC>
					</LeaderBoardUserStyleC>
				);
			})}
		</LeaderBoardStyleC>
	);
}

export default LeaderBoard;
