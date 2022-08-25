import React, { useContext, createContext } from 'react';
import { Socket, io } from 'socket.io-client';

const gameSocketContext = createContext<Socket | null>(null);

export function useGameSocket() {
	return useContext(gameSocketContext) as Socket;
}

function GameSocketContextProvider({ children }: { children: React.ReactNode }) {
	const gameSocket = io('http://localhost:3032/api/games');
	gameSocket.on('connect', () => {});
	return <gameSocketContext.Provider value={gameSocket}>{children}</gameSocketContext.Provider>;
}

export default GameSocketContextProvider;
