import React from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RecoilRoot } from 'recoil';
import GlobalStyle from './ GlobalStyle';
import Router from './routes/Router';

function App() {
	return (
		<RecoilRoot>
			<GlobalStyle />
			<Router />
			<ReactQueryDevtools initialIsOpen />
		</RecoilRoot>
	);
}

export default App;
