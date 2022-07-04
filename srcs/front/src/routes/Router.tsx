import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import AuthPage from './AuthPage';
import GamePage from './GamePage';

function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/game" element={<GamePage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
