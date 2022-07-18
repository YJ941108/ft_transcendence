import React, { useEffect } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import GlobalStyle from './ GlobalStyle';
import Router from './routes/Router';
import { refreshToken } from './modules/login/login';

function App() {
	useEffect(() => {
		refreshToken();
	}, []);
	return (
		<>
			<GlobalStyle />
			<Router />
			<ReactQueryDevtools initialIsOpen />
		</>
	);
}

export default App;
