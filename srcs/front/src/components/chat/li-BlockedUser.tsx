import React from 'react';
import styled from 'styled-components';
import { emitUserAction } from './Emit';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import { Nickname } from './UserStatus';

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

function BlockedUserInfo({ user }: IUserInfo) {
	const chatSocket = useChatSocket();
	return (
		<ListStyle user={user}>
			<Nickname nickname={user.nickname} />
			<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'release')}>
				UNBLOCK
			</UserInteractionStyleC>
		</ListStyle>
	);
}

export default BlockedUserInfo;
