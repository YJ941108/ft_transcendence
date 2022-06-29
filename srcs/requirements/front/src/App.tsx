import React from 'react';
import { ThemeProvider } from 'styled-components';
import { ReactQueryDevtools } from 'react-query/devtools';
import GlobalStyle from './ GlobalStyle';
import mainTheme from './modules/theme';
import Router from './routes/Router';

function App() {
	return (
		<ThemeProvider theme={mainTheme}>
			<GlobalStyle />
			<Router />
			<ReactQueryDevtools initialIsOpen />
		</ThemeProvider>
	);
}

export default App;
