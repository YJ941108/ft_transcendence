import React, { useEffect } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RecoilRoot } from 'recoil';
import GlobalStyle from './ GlobalStyle';
import Router from './routes/Router';
import { refreshToken } from './modules/login/login';

function App() {
	useEffect(() => {
		refreshToken();
	}, []);
	return (
		<RecoilRoot>
			<GlobalStyle />
			<Router />
			<ReactQueryDevtools initialIsOpen />
		</RecoilRoot>
	);
}

export default App;
