import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { emitSendDMMessage } from './Emit';
import { IDMlisten, IDMRoom, IMessages } from '../../modules/Interfaces/chatInterface';
import { DMRoomInfo, MyInfo } from '../../modules/atoms';

const DMRoomStyleC = styled.div`
	min-height: 600px;
	max-height: 600px;
`;

const ChatLogStyleC = styled.ul`
	min-height: 400px;
	max-height: 400px;
	/* height: 100%; */
	overflow-wrap: break-word;
	overflow-y: scroll;
`;

const DMDivStyleC = styled.div`
	width: 100%;
	height: 80px;
	display: flex;
	border: none;
	margin: 0;
`;

const DMInputStyleC = styled.textarea`
	width: 80%;
	resize: none;
	font-family: 'Galmuri7', 'sans-serif';
`;

const DMButtonStyleC = styled.div`
	background-color: red;
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
	const messageBoxRef = useRef<HTMLUListElement>(null);

	const scrollToBottom = () => {
		if (messageBoxRef.current) {
			messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
		}
	};

	const sendMessage = () => {
		if (message) {
			emitSendDMMessage(chatSocket, roomInfo.id, Info.id, message);
			setMessage('');
			scrollToBottom();
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			sendMessage();
		}
	};

	useEffect(() => {
		chatSocket.on('listeningDMRoomInfo', (response: { data: IDMRoom }) => {
			setRoomInfo(response.data);
			console.log(response.data.message, 'messages');
			response.data.message?.map((element: IMessages) => {
				setMessageList((msgList) => {
					return [...msgList, element.content];
				});
				scrollToBottom();
				return () => {};
			});
		});
		return () => {
			chatSocket.off('listeningDMRoomInfo');
		};
	}, [chatSocket]);

	useEffect(() => {
		chatSocket.on('listeningDMMessage', (response: IDMlisten) => {
			setMessageList((msg) => {
				return [...msg, response.data.message];
			});
			scrollToBottom();
		});
		return () => {
			chatSocket.off('listeningDMMessage');
		};
	}, [chatSocket]);

	return (
		<DMRoomStyleC>
			<ChatLogStyleC ref={messageBoxRef}>
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
					onClick={() => {
						sendMessage();
					}}
				/>
			</DMDivStyleC>
		</DMRoomStyleC>
	);
}
export default DMRoom;
