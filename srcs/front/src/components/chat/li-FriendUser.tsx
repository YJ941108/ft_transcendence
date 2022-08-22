import React from 'react';
import styled from 'styled-components';
import { emitUserAction } from './Emit';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
// import PlayButton from './PlayButton';
import UserStatus from './UserStatus';

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

function FriendUserInfo({ user }: IUserInfo) {
	const chatSocket = useChatSocket();

	return (
		<ListStyle user={user}>
			<UserInfoDivStyleC>
				<UserNickNameStyleC>{user.nickname}</UserNickNameStyleC>
				<UserStatus user={user} />
				<UserInteractionStyleC onClick={() => emitUserAction(chatSocket, user.nickname, 'delete')}>
					DEL
				</UserInteractionStyleC>
				{/* <PlayButton user={user} /> */}
			</UserInfoDivStyleC>
		</ListStyle>
	);
}

export default FriendUserInfo;
