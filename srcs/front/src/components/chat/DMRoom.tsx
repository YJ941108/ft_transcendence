import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { emitSendDMMessage } from './Emit';
import { IDMRoomInfo, IMessages } from '../../modules/Interfaces/chatInterface';
import { DMRoomInfo, MyInfo } from '../../modules/atoms';

const DMRoomStyleC = styled.div`
	height: 100%;
	border-left: 1px solid white;
`;

const ChatLogStyleC = styled.ul`
	height: 90%;
	overflow-y: scroll;
`;

const DMDivStyleC = styled.div`
	width: 100%;
	height: 10%;
	display: flex;
`;

const DMInputStyleC = styled.input`
	height: 100%;
	width: 100%;
	vertical-align: top;
`;

const DMButtonStyleC = styled.button`
	height: 100%;
	width: 20%;
`;

interface ISocket {
	chatSocket: Socket;
}

function DMRoom({ chatSocket }: ISocket) {
	const [message, setMessage] = useState('');
	const [roomInfo, setRoomInfo] = useRecoilState<IDMRoomInfo>(DMRoomInfo);
	const [messageList, setMessageList] = useState<string[]>([]);
	const Info = useRecoilValue(MyInfo);

	const sendMessage = () => {
		if (message) {
			emitSendDMMessage(chatSocket, roomInfo.data.id, Info.id, message);
			setMessage('');
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			sendMessage();
		}
	};

	useEffect(() => {
		chatSocket.on('listeningDMRoomInfo', (response: IDMRoomInfo) => {
			setRoomInfo(response);
			const { messages } = response.data;
			setMessageList([]);
			messages.forEach((element: IMessages) => {
				console.log(messageList);
				setMessageList((msgList) => {
					return [...msgList, element.content];
				});
			});
		});
		return () => {
			chatSocket.off('listeningDMRoomInfo');
		};
	}, [chatSocket, messageList, roomInfo]);

	return (
		<DMRoomStyleC>
			<ChatLogStyleC>
				{messageList?.map((msg: string) => {
					return <li>{msg}</li>;
				})}
			</ChatLogStyleC>
			<DMDivStyleC>
				<DMInputStyleC
					onKeyPress={(event) => handleKeyPress(event)}
					value={message}
					onChange={(event) => {
						setMessage(event.target.value);
					}}
				/>
				<DMButtonStyleC
					type="button"
					onClick={() => {
						sendMessage();
					}}
				/>
			</DMDivStyleC>
		</DMRoomStyleC>
	);
}
export default DMRoom;
