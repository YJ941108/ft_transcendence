import React from 'react';
import styled from 'styled-components';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { emitUserAction } from './Emit';
import { useChatSocket } from './SocketContext';

const UserStatusStyleC = styled.p`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
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

function UserStatus({ user }: IUserInfo) {
	// const chatSocket = useChatSocket();

	if (user.isPlaying) {
		return <UserStatusStyleC>PLAYING</UserStatusStyleC>;
	}
	if (user.isOnline) {
		return <UserStatusStyleC>ONLINE</UserStatusStyleC>;
	}
	return <UserStatusStyleC>OFFLINE</UserStatusStyleC>;
}

export default UserStatus;
