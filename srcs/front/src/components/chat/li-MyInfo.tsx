import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { deleteToken } from '../../modules/login/login';
import { useChatSocket } from './SocketContext';

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
export interface IMyInfo {
	id: number;
	nickname: string;
	photo: string;
}

function MyUserInfo({ id, nickname, photo }: IMyInfo) {
	const socket = useChatSocket();
	const navigate = useNavigate();
	console.log(id);
	return (
		<RequestUserStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={photo} alt={nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{nickname}</UserNickNameStyleC>
			</UserInfoDivStyleC>
			<button
				type="button"
				onClick={() => {
					deleteToken();
					socket.disconnect();
					console.log(socket);
					navigate('/');
				}}
			>
				LOGOUT
			</button>
		</RequestUserStyleC>
	);
}

export default MyUserInfo;
