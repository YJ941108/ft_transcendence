import React from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { emitCreateDMRoom, emitUserAction } from './Emit';
import { IUserList } from '../../modules/Interfaces/userInterface';
import { chatContent, MyInfo } from '../../modules/atoms';

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

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

const UserStyleC = styled.li`
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

function DirectMessageInfo({ id, nickname, photo, chatSocket, isOnline }: IUserList) {
	const info = useRecoilValue(MyInfo);
	if (info.id !== id) {
		const createDMRoom = useSetRecoilState(chatContent);
		return (
			<UserStyleC>
				<UserPhotoDivStyleC>
					<UserPhotoStyleC src={photo} alt={nickname} />
				</UserPhotoDivStyleC>
				<UserInfoDivStyleC>
					<UserNickNameStyleC>{nickname}</UserNickNameStyleC>
					{isOnline ? (
						<UserNickNameStyleC>ONLINE</UserNickNameStyleC>
					) : (
						<UserNickNameStyleC>OFFLINE</UserNickNameStyleC>
					)}
					<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, nickname, 'request')}>
						ADD
					</UserInteractionStyleC>
					<UserInteractionStyleC>PLAY</UserInteractionStyleC>
					<UserInteractionStyleC
						onClick={() => {
							emitCreateDMRoom(chatSocket, id);
							createDMRoom('DMRoom');
						}}
					>
						MSG
					</UserInteractionStyleC>
					{/* <UserInteractionStyleC onClick={() => createDMRoom('DMRoom')}>DMROOM</UserInteractionStyleC> */}
				</UserInfoDivStyleC>
			</UserStyleC>
		);
	}
}

export default DirectMessageInfo;
