import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { emitUserAction } from './Emit';
import { useChatSocket } from './SocketContext';

const UserStatusStyleC = styled.li`
	/* font-size: 0.8rem; */
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	/* font-size: 0.8rem; */
	cursor: pointer;
	&:hover {
		color: gray;
	}
`;

const NickNameStyleC = styled.li`
	/* font-size: 0.8rem; */
	/* width: 100%; */
	list-style: none;
	margin: 0 3px 3px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
`;

export function BlockedStatus({ user }: IUserInfo) {
	const chatSocket = useChatSocket();

	if (user.isBlocked) {
		return (
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'release')}>
				UNBLOCK
			</UserInteractionStyleC>
		);
	}
	return (
		<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'block')}>
			BLOCK
		</UserInteractionStyleC>
	);
}

export function FriendsStatus({ user }: IUserInfo) {
	const chatSocket = useChatSocket();

	if (user.isFriend) {
		return (
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'delete')}>
				DEL
			</UserInteractionStyleC>
		);
	}
	if (user.isRequest) {
		return <UserInteractionStyleC>ADDED</UserInteractionStyleC>;
	}
	return (
		<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'request')}>
			ADD
		</UserInteractionStyleC>
	);
}

interface INickName {
	nickname: string;
}

export function Nickname({ nickname }: INickName) {
	return (
		<NickNameStyleC>
			<Link to={`/main/another/${nickname}`}>{nickname} </Link>
		</NickNameStyleC>
	);
}

function UserStatus({ user }: IUserInfo) {
	const chatSocket = useChatSocket();

	if (user.isPlaying) {
		return (
			<UserStatusStyleC
				onClick={() => {
					chatSocket.emit('spectateRoom', user.roomId);
				}}
			>
				PLAYING
			</UserStatusStyleC>
		);
	}
	if (user.isOnline) {
		return <UserStatusStyleC>ONLINE</UserStatusStyleC>;
	}
	return <UserStatusStyleC>OFFLINE</UserStatusStyleC>;
}

export default UserStatus;
