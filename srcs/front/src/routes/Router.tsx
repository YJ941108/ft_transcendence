import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import AuthPage from './AuthPage';
import GamePage from './GamePage';
import ProfilePage from './ProfilePage';
import FriendsPage from './FriendsPage';
import LeaderboardPage from './LeaderboardPage';

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
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
