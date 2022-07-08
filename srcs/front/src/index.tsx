import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';
import App from './App';
import mainTheme from './modules/theme';

const queryClient = new QueryClient();
axios.defaults.baseURL = 'http://3.39.20.24:3032';
axios.defaults.withCredentials = true;
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={mainTheme}>
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
