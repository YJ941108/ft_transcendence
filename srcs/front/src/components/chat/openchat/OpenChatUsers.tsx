import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { channelInfoData, chatContent, MyInfo } from '../../../modules/atoms';
import { IChannel, IMyData, IUserBanned } from '../../../modules/Interfaces/chatInterface';
import { getChannelInfo } from '../../../modules/api';
import IUserData from '../../../modules/Interfaces/userInterface';
import OpenChatUser from './OpenChatUser';
import OpenChatOwner from './OpenChatOwner';
import { useChatSocket } from '../SocketContext';

function OpenChatUsers() {
	const chatSocket = useChatSocket();
	const [channelInfo, setChannelInfo] = useRecoilState<IChannel>(channelInfoData);
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const [isMeAdmin, setIsMeAdmin] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const {
		isLoading,
		data: basicChannelInfo,
		error,
	} = useQuery(['channel', channelInfo.id], () => getChannelInfo(channelInfo.id));
	const setContent = useSetRecoilState(chatContent);

	useEffect(() => {
		if (isLoading || error || !basicChannelInfo) return () => {};
		setChannelInfo(basicChannelInfo.data);
		return () => {};
	}, [basicChannelInfo]);

	useEffect(() => {
		if (myInfo.id === channelInfo.owner.id) setIsOwner(true);
		if (channelInfo.admins.findIndex((e) => e.id === myInfo.id) !== -1) setIsMeAdmin(true);
		else setIsMeAdmin(false);
	}, [channelInfo]);

	useEffect(() => {
		chatSocket.on('listeningChannelInfo', (response: { data: IChannel }) => {
			console.log('listeningChannelInfo', response.data);
			setChannelInfo(response.data);
		});
		chatSocket.on('listeningBan', (response: IUserBanned) => {
			if (myInfo.id === response.data.id) setContent('OpenChatList');
		});
		return () => {
			chatSocket.off('listeningChannelInfo');
			chatSocket.off('listeningBan');
		};
	}, [chatSocket]);

	if (isLoading || error) return null;
	return (
		<div>
			<h1>OpenChatUsers</h1>
			<button type="button" onClick={() => setContent('OpenChatRoom')}>
				quit
			</button>
			<ul>
				<OpenChatOwner owner={channelInfo.owner} />
				{channelInfo.users?.map((user: IUserData) => {
					let isAdmin = false;
					if (channelInfo.admins?.findIndex((e) => e.id === user.id) !== -1) isAdmin = true;
					if (user.id !== myInfo.id && channelInfo.owner.id !== user.id)
						return (
							<OpenChatUser
								key={user.id}
								isOwner={isOwner}
								isAdmin={isAdmin}
								isMeAdmin={isMeAdmin}
								user={user}
								channelInfo={channelInfo}
								myInfo={myInfo}
							/>
						);
					return null;
				})}
			</ul>
		</div>
	);
}

export default OpenChatUsers;
