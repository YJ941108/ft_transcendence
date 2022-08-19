import React, { useContext, createContext } from 'react';
import { Socket, io } from 'socket.io-client';

const socketContext = createContext<Socket | null>(null);

export function useChatSocket() {
	return useContext(socketContext) as Socket;
}

function SocketContextProvider({ children }: { children: React.ReactNode }) {
	const mySocket = io('http://3.39.20.24:3032/api/chat');
	return <socketContext.Provider value={mySocket}>{children}</socketContext.Provider>;
}

export default SocketContextProvider;
