import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// import ChatList from './ChatList';

let socket: Socket;
// const socket = io.connect('http://localhost:3001');

function Chatting() {
	const init: string[] = [];
	const [message, setMessage] = useState('');
	const [messageList, setMessageList] = useState(init);

	const sendMessage = () => {
		if (message) {
			socket.emit('send_message', { message });
			setMessageList([...messageList, message]);
			setMessage('');
		}
	};

	useEffect(() => {
		socket = io('http://localhost:3000');
		socket = socket.on('receive_message', (data) => {
			setMessageList((messages) => {
				return [...messages, data.message];
			});
		});
	}, []);

	return (
		<div className="App">
			<input
				placeholder="Message"
				value={message}
				onChange={(event) => {
					setMessage(event.target.value);
				}}
			/>
			<button type="button" onClick={sendMessage}>
				Send
			</button>
			<ul>
				{messageList.map((msg) => {
					return <li>{msg}</li>;
				})}
			</ul>
		</div>
	);
}

export default Chatting;
