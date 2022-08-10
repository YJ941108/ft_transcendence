import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { emitSendDMMessage } from './Emit';
import { IDMlisten, IDMRoom, IMessages } from '../../modules/Interfaces/chatInterface';
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
	const [roomInfo, setRoomInfo] = useRecoilState<IDMRoom>(DMRoomInfo);
	const [messageList, setMessageList] = useState<string[]>([]);
	const Info = useRecoilValue(MyInfo);

	const sendMessage = () => {
		if (message) {
			emitSendDMMessage(chatSocket, roomInfo.id, Info.id, message);
			setMessage('');
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			sendMessage();
		}
	};

	useEffect(() => {
		chatSocket.on('listeningDMRoomInfo', (response: { data: IDMRoom }) => {
			setRoomInfo(response.data);
			console.log(response, '여긴오냐?');
			console.log(response.data.message, 'messages');
			response.data.message?.map((element: IMessages) => {
				console.log(element, 'FUCK YOU');
				setMessageList((msgList) => {
					return [...msgList, element.content];
				});
				return () => {};
			});
		});
		return () => {
			chatSocket.off('listeningDMRoomInfo');
		};
	}, [chatSocket]);

	useEffect(() => {
		chatSocket.on('listeningDMMessage', (response: IDMlisten) => {
			setMessageList((msgList) => {
				return [...msgList, response.data.message];
			});
		});
		return () => {
			chatSocket.off('listeningDMMessage');
		};
	}, [chatSocket]);

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
