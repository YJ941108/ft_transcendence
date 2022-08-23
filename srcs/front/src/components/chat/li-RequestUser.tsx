import React from 'react';
import styled from 'styled-components';
import { emitUserAction } from './Emit';
import { useChatSocket } from './SocketContext';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import ListStyle from './UserInfoStyle';
import { Nickname } from './UserStatus';

const UserNickNameStyleC = styled.p`
	margin: 3px 0;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

function RequestUserInfo({ user }: IUserInfo) {
	const chatSocket = useChatSocket();
	return (
		<ListStyle user={user}>
			<Nickname nickname={user.nickname} />
			{/* <UserNickNameStyleC>{user.nickname}</UserNickNameStyleC> */}
			{user.isOnline ? (
				<UserNickNameStyleC>ONLINE</UserNickNameStyleC>
			) : (
				<UserNickNameStyleC>OFFLINE</UserNickNameStyleC>
			)}
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'accept')}>
				ACCEPT
			</UserInteractionStyleC>
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'deny')}>
				DENY
			</UserInteractionStyleC>
		</ListStyle>
	);
}

export default RequestUserInfo;
