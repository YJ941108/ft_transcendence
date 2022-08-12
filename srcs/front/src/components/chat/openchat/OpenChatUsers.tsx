import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { channelInfoData, chatContent } from '../../../modules/atoms';
import { IChannel } from '../../../modules/Interfaces/chatInterface';
import IUserData from '../../../modules/Interfaces/userInterface';

function OpenChatUsers() {
	const channelData = useRecoilValue<IChannel>(channelInfoData);
	const setContent = useSetRecoilState(chatContent);
	return (
		<div>
			<h1>OpenChatUsers</h1>
			<button type="button" onClick={() => setContent('OpenChatRoom')}>
				quit
			</button>
			<ul>
				{channelData.users?.map((user: IUserData) => {
					return <li key={user.id}>{user.nickname}</li>;
				})}
			</ul>
		</div>
	);
}

export default OpenChatUsers;
