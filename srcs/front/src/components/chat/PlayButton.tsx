import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IUserInfo } from '../../modules/Interfaces/userInterface';
import { IDebug } from './Emit';
import { useChatSocket } from './SocketContext';

const UserInteractionStyleC = styled.span`
	margin: 0 3px 3px 0;
	cursor: pointer;
`;

function PlayButton({ user }: IUserInfo) {
	const chatSocket = useChatSocket();
	const navigate = useNavigate();
	const url = window.location.href.split('/').pop();
	const emitSendPongInvite = (anotherId: number) => {
		chatSocket.emit('sendPongInvite', { anotherId }, (response: IDebug) => {
			if (response.code === 200) {
				if (url !== 'game') {
					navigate('/main/game');
				} else {
					window.location.reload();
				}
			} else if (response.code === 400) {
				console.log('sendPongInvite FAIL', response);
			}
		});
	};

	return <UserInteractionStyleC onClick={() => emitSendPongInvite(user.id)}>PLAY</UserInteractionStyleC>;
}

export default PlayButton;
