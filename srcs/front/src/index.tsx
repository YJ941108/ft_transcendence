import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import axios from 'axios';
import App from './App';
import mainTheme from './modules/theme';

const queryClient = new QueryClient();
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<QueryClientProvider client={queryClient}>
		<ThemeProvider theme={mainTheme}>
			<RecoilRoot>
				<App />
			</RecoilRoot>
		</ThemeProvider>
	</QueryClientProvider>
);
