import React from 'react';
// import styled from 'styled-components';
// import { useNavigate } from 'react-router-dom';
// import { IDebug } from './Emit';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import PlayButton from './PlayButton';
// import { useChatSocket } from './SocketContext';
import ListStyle from './UserInfoStyle';
import UserStatus, { BlockedStatus, FriendsStatus, Nickname } from './UserStatus';
// import PlayButton from './PlayButton';

// const UserNickNameStyleC = styled.p`
// 	margin: 3px 0;
// `;

// const UserInteractionStyleC = styled.span`
// 	margin: 0 3px 3px 0;
// 	cursor: pointer;
// `;

function UserInfo({ user }: IUserInfo) {
	return (
		<ListStyle user={user}>
			<Nickname nickname={user.nickname} />
			{/* <UserNickNameStyleC>{user.nickname}</UserNickNameStyleC> */}
			<UserStatus user={user} />
			<FriendsStatus user={user} />
			<BlockedStatus user={user} />
			<PlayButton user={user} />
		</ListStyle>
	);
}

export default UserInfo;
