import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import styled from 'styled-components';
import { MyInfo } from '../../modules/atoms';
import { deleteToken } from '../../modules/login/login';
import { useChatSocket } from './SocketContext';
import { IMyData } from '../../modules/Interfaces/chatInterface';

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
	white-space: no-wrap;
	max-width: 150px;
	text-overflow: ellipsis;
	overflow: hidden;
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
	user: IMyData;
}

function MyUserInfo({ user }: IMyInfo) {
	const socket = useChatSocket();
	const navigate = useNavigate();
	const Logout = () => {
		deleteToken();
		socket.disconnect();
		navigate('/');
		useResetRecoilState(MyInfo);
	};
	return (
		<RequestUserStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={user.photo} alt={user.nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{user.nickname}</UserNickNameStyleC>
				<UserNickNameStyleC
					onClick={() => {
						Logout();
					}}
				>
					LOGOUT
				</UserNickNameStyleC>
			</UserInfoDivStyleC>
		</RequestUserStyleC>
	);
}

export default MyUserInfo;
