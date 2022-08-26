import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { chatContent } from '../../modules/atoms';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { emitCreateDMRoom, emitUserAction, IDebug } from './Emit';
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
	margin: 0 3px 3px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
`;

export function DMButton({ id }: IUserID) {
	const chatSocket = useChatSocket();
	const createDMRoom = useSetRecoilState(chatContent);
	return (
		<UserInteractionStyleC
			onClick={() => {
				emitCreateDMRoom(chatSocket, id);
				createDMRoom('DMRoom');
			}}
		>
			DM
		</UserInteractionStyleC>
	);
}

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
		<>
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'block')}>
				BLOCK
			</UserInteractionStyleC>
			<DMButton id={user.id} />
		</>
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
interface IUserID {
	id: number;
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
	const navigate = useNavigate();

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningSpectateRoom', (response: IDebug) => {
				const url = window.location.href.split('/').pop();
				if (url !== 'game') {
					navigate('/main/game');
				} else if (response.code === 200) {
					window.location.reload();
				}
			});
			return () => {
				chatSocket.off('listeningSpectateRoom');
			};
		}
		return () => {};
	}, [chatSocket]);

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
