import React, { useContext, createContext } from 'react';
import { Socket, io } from 'socket.io-client';

const chatSocketContext = createContext<Socket | null>(null);

export function useChatSocket() {
	return useContext(chatSocketContext) as Socket;
}

function SocketContextProvider({ children }: { children: React.ReactNode }) {
	const chatSocket = io('http://localhost:3032/api/chat');
	chatSocket.on('connect', () => {
		console.log('연결 성공');
	});
	return <chatSocketContext.Provider value={chatSocket}>{children}</chatSocketContext.Provider>;
}

export default SocketContextProvider;
