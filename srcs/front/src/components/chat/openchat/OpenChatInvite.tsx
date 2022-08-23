import React from 'react';
import styled from 'styled-components';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { channelInfoData, chatContent, chatUserList, MyInfo } from '../../../modules/atoms';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
import IUserData from '../../../modules/Interfaces/userInterface';
import { useChatSocket } from '../SocketContext';

const UserListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 70%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
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

const UserPhotoStyleC = styled.img`
	width: 20px;
	height: 20px;
	object-fit: cover;
	object-position: center;
`;

const UserNickNameStyleC = styled.p`
	margin: 3px 0;
`;

function OpenChatInvite() {
	const chatSocket = useChatSocket();
	const userList = useRecoilValue<IUserData[]>(chatUserList);
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const channelInfo = useRecoilValue<IChannel>(channelInfoData);
	const setChatContent = useSetRecoilState(chatContent);
	const onInviteUser = (userData: IUserData) => {
		chatSocket.emit('joinChannel', {
			channelId: channelInfo.id,
			userId: userData.id,
		});
		setChatContent('OpenChatRoom');
	};
	return (
		<div>
			<h1>Invite</h1>
			<UserListStyleC>
				{userList?.map((user: IUserData) => {
					if (user.id !== myInfo.id)
						return (
							<UserStyleC key={user.id} onClick={() => onInviteUser(user)}>
								<UserPhotoStyleC src={user.photo} alt="user" />
								<UserNickNameStyleC>{user.nickname}</UserNickNameStyleC>
							</UserStyleC>
						);
					return null;
				})}
			</UserListStyleC>
		</div>
	);
}

export default OpenChatInvite;
