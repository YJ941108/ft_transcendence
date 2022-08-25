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
	width: 200px;
	word-wrap: nowrap;
	overflow: hidden;
	text-align: left;
	text-overflow: ellipsis;
`;

const UserGameInfoStyleC = styled.span`
	text-align: right;
	margin-left: 20px;
	width: 200px;
	word-wrap: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

function LeaderBoardUserInfo({ user }: IUserInfo) {
	return (
		<UserInfoStlyeC>
			<Link to={`/main/another/${user.nickname}`}>
				<UserNameStyleC>{user.nickname}</UserNameStyleC>
			</Link>
			<UserGameInfoStyleC>
				{user.wins}W {user.losses}L {user.ratio}pts
			</UserGameInfoStyleC>
		</UserInfoStlyeC>
	);
}

export default LeaderBoardUserInfo;
