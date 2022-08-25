import React from 'react';
import styled from 'styled-components';
import { emitUserAction } from './Emit';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import UserStatus, { DMButton, Nickname } from './UserStatus';
import PlayButton from './PlayButton';

const UserInfoDivStyleC = styled.div`
	max-width: 70%;
	margin: 5px;
`;

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

function FriendUserInfo({ user }: IUserInfo) {
	const chatSocket = useChatSocket();

	return (
		<ListStyle user={user}>
			<UserInfoDivStyleC>
				<Nickname nickname={user.nickname} />
				<UserStatus user={user} />
				<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'delete')}>
					DEL
				</UserInteractionStyleC>
				<DMButton id={user.id} />
				<PlayButton user={user} />
			</UserInfoDivStyleC>
		</ListStyle>
	);
}

export default FriendUserInfo;
