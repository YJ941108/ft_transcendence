import React from 'react';
import styled from 'styled-components';
import { emitUserAction } from './Emit';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import UserStatus, { Nickname } from './UserStatus';

// const UserNickNameStyleC = styled.p`
// 	margin: 3px 0;
// `;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

function BlockedUserInfo({ user }: IUserInfo) {
	const chatSocket = useChatSocket();
	return (
		<ListStyle user={user}>
			<Nickname nickname={user.nickname} />
			<UserStatus user={user} />
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'release')}>
				UNBLOCK
			</UserInteractionStyleC>
			<UserInteractionStyleC>PLAY</UserInteractionStyleC>
		</ListStyle>
	);
}

export default BlockedUserInfo;
