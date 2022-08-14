import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { channelInfoData, chatContent, MyInfo } from '../../../modules/atoms';
import { IChannel, IMyData } from '../../../modules/Interfaces/chatInterface';
import IUserData from '../../../modules/Interfaces/userInterface';

interface IAdminButton {
	isAdmin: boolean;
}

const AdminButton = styled.button<IAdminButton>`
	background-color: ${(props) => (props.isAdmin ? 'red' : 'blue')};
`;

function OpenChatUsers({ chatSocket }: any) {
	const [channelInfo, setChannelInfo] = useRecoilState<IChannel>(channelInfoData);
	const myInfo = useRecoilValue<IMyData>(MyInfo);
	const [isOwner, setIsOwner] = useState(false);
	const setContent = useSetRecoilState(chatContent);

	useEffect(() => {
		if (myInfo.id === channelInfo.owner.id) setIsOwner(true);
	}, []);

	useEffect(() => {
		chatSocket.on('listeningChannelInfo', (response: { data: IChannel }) => {
			setChannelInfo(response.data);
		});

		return () => {
			chatSocket.off('listeningChannelInfo');
		};
	}, [chatSocket]);

	const setAdmin = (userId: number) => {
		if (channelInfo.admins.findIndex((e) => e.id === userId) !== -1) {
			chatSocket.emit('removeAdmin', {
				channelId: channelInfo.id,
				ownerId: channelInfo.owner.id,
				userId,
			});
		} else {
			chatSocket.emit('makeAdmin', {
				channelId: channelInfo.id,
				ownerId: channelInfo.owner.id,
				userId,
			});
		}
	};

	return (
		<div>
			<h1>OpenChatUsers</h1>
			<button type="button" onClick={() => setContent('OpenChatRoom')}>
				quit
			</button>
			<ul>
				{channelInfo.users?.map((user: IUserData) => {
					let isAdmin = false;
					if (channelInfo.admins.findIndex((e) => e.id === user.id) !== -1) isAdmin = true;
					return (
						<li key={user.id}>
							<span>{user.nickname}</span>
							{isOwner ? (
								<AdminButton isAdmin={isAdmin} type="button" onClick={() => setAdmin(user.id)}>
									admin
								</AdminButton>
							) : null}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default OpenChatUsers;
