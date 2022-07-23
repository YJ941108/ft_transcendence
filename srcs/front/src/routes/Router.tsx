import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ErrorPage from './pages/ErrorPage';

function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/game" element={<GamePage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/friends" element={<FriendsPage />} />
				<Route path="/leaderboard" element={<LeaderboardPage />} />
				<Route path="*" element={<ErrorPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
