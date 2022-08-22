import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { emitSendDMMessage, IDebug } from './Emit';
import { IDMRoom, IMessageResponse, IMessages } from '../../modules/Interfaces/chatInterface';
import { DMRoomInfo, MyInfo } from '../../modules/atoms';
import { useChatSocket } from './SocketContext';

const DMRoomStyleC = styled.div`
	min-height: 800px;
	max-height: 800px;
`;

const ChatLogStyleC = styled.ul`
	min-height: 720px;
	max-height: 720px;
	border-bottom: solid white 2px;
	height: 100%;
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
	height: 100%;
	resize: none;
	background-color: black;
	color: white;
	border: none;
	&:hover {
		border: 1px solid rgba(0, 0, 0, 0.3);
	}
	&:focus {
		outline: none;
		/* outline: 1px solid rgba(0, 0, 0, 0.5); */
		border: 1px solid rgba(0, 0, 0, 0.3);
	}
`;

const DMSendButtonStyleC = styled.button`
	background-color: black;
	color: white;
	/* height: 100%; */
	width: 20%;
	border: 1px solid white;
	margin: 10px;
	/* border: none; */
`;

const AcceptButtonStyleC = styled.button`
	width: 50px;
	height: 1rem;
`;

const ChatMessageStyleC = styled.li`
	margin: 3px;
`;

function DMRoom() {
	const chatSocket = useChatSocket();
	const navigate = useNavigate();
	const url = window.location.href.split('/').pop();
	const [message, setMessage] = useState('');
	const [roomInfo, setRoomInfo] = useRecoilState<IDMRoom>(DMRoomInfo);
	const [messageList, setMessageList] = useState<IMessages[]>([]);
	const Info = useRecoilValue(MyInfo);
	const messageBoxRef = useRef<HTMLUListElement>(null);
	const emitAcceptPongInvite = (roomId: string, messageId: number) => {
		chatSocket.emit('acceptPongInvite', { roomId, messageId }, (response: IDebug) => {
			if (response.code === 200) {
				if (url !== 'game') navigate('/main/game');
				else window.location.reload();
			} else if (response.code === 400) {
				console.log('sendPongInvite FAIL', response);
			}
		});
	};
	useEffect(() => {
		const scrollToBottom = (e: Event) => {
			e.stopPropagation();
			e.preventDefault();
			const target = e.currentTarget as HTMLUListElement;

			target.scroll({
				top: target.scrollHeight,
				// behavior: 'smooth',
			});
		};
		if (messageBoxRef.current) {
			messageBoxRef.current.addEventListener('DOMNodeInserted', scrollToBottom);
		}

		return () => {
			if (messageBoxRef.current) {
				messageBoxRef.current.removeEventListener('DOMNodeInserted', scrollToBottom);
			}
		};
	}, []);

	const sendMessage = () => {
		if (message.trim() !== '') {
			emitSendDMMessage(chatSocket, roomInfo.id, Info.id, message);
			console.log(messageList);
			// scrollToBottom();
		}
		const timer = setTimeout(() => {
			setMessage('');
			clearTimeout(timer);
		}, 0);
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			sendMessage();
		}
	};

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMRoomInfo', (response: { data: IDMRoom }) => {
				setRoomInfo(response.data);
				response.data.message?.map((element: IMessages) => {
					setMessageList((msgList) => {
						return [...msgList, element];
					});
					return () => {};
				});
			});
			return () => {
				chatSocket.off('listeningDMRoomInfo');
			};
		}
		return () => {};
	}, [chatSocket]);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMMessage', (response: IMessageResponse) => {
				setMessageList((msgList) => {
					return [...msgList, response.data];
				});
			});
			return () => {
				chatSocket.off('listeningDMMessage');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<DMRoomStyleC>
			<ChatLogStyleC ref={messageBoxRef}>
				{messageList?.map((msg: IMessages) => {
					if (msg.type === 'invite') {
						return (
							<ChatMessageStyleC key={msg.id}>
								<Link to={`/main/another/${msg.author.nickname}`}>{msg.author.nickname}</Link> : {msg.content}
								<AcceptButtonStyleC
									onClick={() => {
										emitAcceptPongInvite(msg.roomId, msg.id);
									}}
								/>
							</ChatMessageStyleC>
						);
					}
					return (
						<ChatMessageStyleC key={msg.id}>
							<Link to={`/main/another/${msg.author.nickname}`}>{msg.author.nickname}</Link> : {msg.content}
						</ChatMessageStyleC>
					);
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
				<DMSendButtonStyleC
					onClick={() => {
						sendMessage();
					}}
				>
					SEND
					{/* <img src="/img/send.png" width="16px" alt="send" /> */}
				</DMSendButtonStyleC>
			</DMDivStyleC>
		</DMRoomStyleC>
	);
}

export default DMRoom;
