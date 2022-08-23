import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IUserInfo } from '../../modules/Interfaces/userInterface';

const UserInfoStlyeC = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	margin-left: 10px;
	/* background-color: red; */
`;

const UserNameStyleC = styled.span`
	max-width: 100px;
	background-color: red;
	overflow: hidden;
	text-overflow: ellipsis;
`;

function LeaderBoardUserInfo({ user }: IUserInfo) {
	return (
		<UserInfoStlyeC>
			<Link to={`/main/another/${user.nickname}`}>
				<UserNameStyleC>{user.nickname}</UserNameStyleC>
			</Link>
			<UserNameStyleC>
				{user.wins}W {user.losses}L {user.ratio}pts
			</UserNameStyleC>
		</UserInfoStlyeC>
	);
}

export default LeaderBoardUserInfo;
