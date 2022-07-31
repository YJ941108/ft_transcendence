import React from 'react';
import styled from 'styled-components';

const UserInfoStyleC = styled.li`
	display: flex;
	height: 5rem;
	border-bottom: 1px solid white;
	margin: 5px;
	align-items: center;
	overflow: hidden;
	justify-content: space-between;
`;

const UserPhotoDivStyleC = styled.div`
	width: 30%;
	height: 100%;
	overflow: hidden;
	background-color: black;
	display: flex;
	align-items: center;
`;

const UserPhotoStyleC = styled.img`
	width: 100%;
	margin: auto;
`;

const UserInfoDivStyleC = styled.div`
	width: 65%;
`;

const UserNickNameStyleC = styled.p`
	font-size: 16px;
	margin-bottom: 3px;
`;

interface IUserInfo {
	nickname: string;
	photo: string;
}

function UserInfo({ nickname, photo }: IUserInfo) {
	return (
		<UserInfoStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={photo} alt="hi" />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{nickname}</UserNickNameStyleC>
				<p>ADD | MESSAGE | PLAY</p>
			</UserInfoDivStyleC>
		</UserInfoStyleC>
	);
}

export default UserInfo;
