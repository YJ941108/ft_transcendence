import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
import IUserData from '../../../modules/Interfaces/userInterface';
import { useChatSocket } from '../SocketContext';

interface IOwnerButton {
	isOwner?: boolean;
	isAdmin?: boolean;
}

interface IAdminButton {
	isMeAdmin?: boolean;
	isOwner?: boolean;
}

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

const OwnerButtonStyleC = styled.button<IOwnerButton>`
	font-size: 12px;
	visibility: ${(props) => (props.isOwner ? 'visible' : 'hidden')};
	margin: 0 3px 3px 0;
	color: ${(props) => (props.isAdmin ? 'red' : 'white')};
	background-color: rgba(0, 0, 0, 0);
	border: 0;
	outline: 0;
	cursor: pointer;
`;

const AdminButtonStyleC = styled.button<IAdminButton>`
	font-size: 12px;
	visibility: ${(props) => {
		if (props.isMeAdmin || props.isOwner) return 'visible';
		return 'hidden';
	}};
	margin: 0 3px 3px 0;
	background-color: rgba(0, 0, 0, 0);
	color: white;
	border: 0;
	outline: 0;
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

interface IOpenChatUserProps {
	isOwner: boolean;
	isAdmin: boolean;
	isMeAdmin: boolean;
	user: IUserData;
	myInfo: IMyData;
	channelInfo: IChannel;
}

function OpenChatUser({ isOwner, isAdmin, isMeAdmin, user, channelInfo, myInfo }: IOpenChatUserProps) {
	const chatSocket = useChatSocket();

	const setAdmin = (userId: number) => {
		if (channelInfo.admins.findIndex((e) => e.id === userId) !== -1) {
			chatSocket.emit('removeAdmin', {
				channelId: channelInfo.id,
				ownerId: channelInfo.owner.id,
				userId,
			});
		} else {
			chatSocket.emit('makeAdmin', {
				channelId: channelInfo.id,
				ownerId: channelInfo.owner.id,
				userId,
			});
		}
	};

	const setPunishUser = (userId: number, type: 'ban' | 'mute') => {
		chatSocket.emit('punishUser', {
			channelId: channelInfo.id,
			adminId: myInfo.id,
			userId,
			type,
		});
		alert(`${type} succeed`);
	};

	const setKickUser = (userId: number) => {
		chatSocket.emit('kickUser', {
			channelId: channelInfo.id,
			adminId: myInfo.id,
			userId,
		});
	};

	return (
		<UserStyleC>
			<UserPhotoDivStyleC>
				<UserPhotoStyleC src={user.photo} alt={user.nickname} />
			</UserPhotoDivStyleC>
			<UserInfoDivStyleC>
				<Link to={`/main/another/${user.nickname}`}>
					<UserNickNameStyleC>{user.nickname}</UserNickNameStyleC>
				</Link>
				<OwnerButtonStyleC isOwner={isOwner} isAdmin={isAdmin} onClick={() => setAdmin(user.id)}>
					ADMIN
				</OwnerButtonStyleC>
				<AdminButtonStyleC isOwner={isOwner} isMeAdmin={isMeAdmin} onClick={() => setPunishUser(user.id, 'ban')}>
					BAN
				</AdminButtonStyleC>
				<AdminButtonStyleC isOwner={isOwner} isMeAdmin={isMeAdmin} onClick={() => setPunishUser(user.id, 'mute')}>
					MUTE
				</AdminButtonStyleC>
				<AdminButtonStyleC isOwner={isOwner} isMeAdmin={isMeAdmin} onClick={() => setKickUser(user.id)}>
					KICK
				</AdminButtonStyleC>
			</UserInfoDivStyleC>
		</UserStyleC>
	);
}

export default OpenChatUser;
