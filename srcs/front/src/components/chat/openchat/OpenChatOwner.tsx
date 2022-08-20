import React from 'react';
import styled from 'styled-components';
import IUserData from '../../../modules/Interfaces/userInterface';

const UserPhotoDivStyleC = styled.div`
	width: 70px;
	height: 70px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.2);
	margin: 0 5px;
`;

const UserPhotoStyleC = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const UserInfoDivStyleC = styled.div`
	max-width: 70%;
	margin: 5px;
`;

const UserNickNameStyleC = styled.p`
	margin: 3px 0;
`;

const RequestUserStyleC = styled.li`
	display: flex;
	align-items: center;
	height: 85px;
	border-bottom: 1px solid rgba(255, 255, 255, 1);
	overflow: hidden;
	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	&:last-of-type {
		border: none;
	}
`;

interface IOpenChatOwnerProps {
	owner: IUserData;
}

function OpenChatOwner({ owner }: IOpenChatOwnerProps) {
	return (
		<RequestUserStyleC>
			<h1>Owner</h1>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={owner.photo} alt={owner.nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{owner.nickname}</UserNickNameStyleC>
			</UserInfoDivStyleC>
		</RequestUserStyleC>
	);
}

export default OpenChatOwner;
