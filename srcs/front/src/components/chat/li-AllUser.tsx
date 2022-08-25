import React from 'react';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import PlayButton from './PlayButton';
import ListStyle from './UserInfoStyle';
import UserStatus, { BlockedStatus, FriendsStatus, Nickname } from './UserStatus';

function UserInfo({ user }: IUserInfo) {
	return (
		<ListStyle user={user}>
			<Nickname nickname={user.nickname} />
			<UserStatus user={user} />
			<li>
				<FriendsStatus user={user} />
				<BlockedStatus user={user} />
				<PlayButton user={user} />
			</li>
		</ListStyle>
	);
}

export default UserInfo;
