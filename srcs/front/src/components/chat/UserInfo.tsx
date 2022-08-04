// import React, { useEffect } from 'react';
import React from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
// import { IFriendsList } from '../../modules/Interfaces/chatInterface';

const UserInfoStyleC = styled.li`
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

interface IUserInfo {
	nickname: string;
	photo: string;
	chatSocket: Socket;
	isOnline: boolean;
}

const getUsers = (chatSocket: Socket) => {
	chatSocket.emit('getUsers', (response: IDebug) => {
		console.log(response);
	});
};

const emitUserAction = (nickname: string, act: string, chatSocket: Socket) => {
	chatSocket.emit('userAction', { who: nickname, action: act }, (response: IDebug) => {
		if (response.code === 400) {
			alert('FUCK YOU');
		}
	});
	getUsers(chatSocket);
};

interface IDebug {
	func: string;
	code: number;
	message: string;
}

function UserInfo({ nickname, photo, chatSocket, isOnline }: IUserInfo) {
	// useEffect(() => {
	// 	chatSocket.on('listeningFriends', (response: IFriendsList) => {
	// 		console.log(response);
	// 	});
	// }, [chatSocket]);
	return (
		<UserInfoStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={photo} alt={nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{nickname}</UserNickNameStyleC>
				{isOnline ? <UserNickNameStyleC>ONLINE</UserNickNameStyleC> : <UserNickNameStyleC>OFFLINE</UserNickNameStyleC>}
				<UserInteractionStyleC onClick={() => emitUserAction(nickname, 'delete', chatSocket)}>
					DEL
				</UserInteractionStyleC>
				<UserInteractionStyleC onClick={() => emitUserAction(nickname, 'request', chatSocket)}>
					ADD
				</UserInteractionStyleC>
				<UserInteractionStyleC onClick={() => emitUserAction(nickname, 'accept', chatSocket)}>
					ACCEPT
				</UserInteractionStyleC>
				<UserInteractionStyleC onClick={() => emitUserAction(nickname, 'deny', chatSocket)}>DENY</UserInteractionStyleC>
				<UserInteractionStyleC>PLAY</UserInteractionStyleC>
			</UserInfoDivStyleC>
		</UserInfoStyleC>
	);
}

export default UserInfo;
