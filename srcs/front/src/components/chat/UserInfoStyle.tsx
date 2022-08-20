import React from 'react';
// import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
// import { chatContent } from '../../modules/atoms';
import { IListStyle } from '../../modules/Interfaces/userInterface';
// import { emitCreateDMRoom } from './Emit';
// import { useChatSocket } from './SocketContext';

export const UserInfoDivStyleC = styled.div`
	display: flex;
	margin: 5px;
`;

export const UserPhotoDivStyleC = styled.div`
	width: 70px;
	height: 70px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.2);
	margin: 0 5px;
`;

export const UserPhotoStyleC = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

export const UserDataDivStyleC = styled.div`
	margin: 5px;
`;

const UserStyleC = styled.li`
	cursor: pointer;
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

function ListStyle({ user, children }: IListStyle) {
	// const chatSocket = useChatSocket();
	// const createDMRoom = useSetRecoilState(chatContent);
	return (
		<UserStyleC>
			<UserInfoDivStyleC
			// onClick={() => {
			// 	emitCreateDMRoom(chatSocket, user.id);
			// 	createDMRoom('DMRoom');
			// }}
			>
				<UserPhotoDivStyleC>
					<UserPhotoStyleC src={user.photo} alt={user.nickname} />
				</UserPhotoDivStyleC>
				<UserDataDivStyleC>{children}</UserDataDivStyleC>
			</UserInfoDivStyleC>
		</UserStyleC>
	);
}

export default ListStyle;
