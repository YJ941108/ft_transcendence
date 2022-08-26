import React, { useEffect } from 'react';
import GlobalStyle from './GlobalStyle';
import Router from './routes/Router';
import { refreshToken } from './modules/login/login';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/styles/Modal.css';
import SocketContextProvider from './components/chat/SocketContext';
import GameSocketContextProvider from './components/game/GameSocketContext';

function App() {
	useEffect(() => {
		refreshToken();
	}, []);
	return (
		<>
			<GlobalStyle />
			<SocketContextProvider>
				<GameSocketContextProvider>
					<Router />
				</GameSocketContextProvider>
			</SocketContextProvider>
		</>
	);
}

export default App;
