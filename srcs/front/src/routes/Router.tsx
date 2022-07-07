import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ErrorPage from './pages/ErrorPage';
import isAdmin from '../modules/login/isAdmin';

function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/game" element={isAdmin() ? <GamePage /> : <Navigate to="/login" />} />
				<Route path="/profile" element={isAdmin() ? <ProfilePage /> : <Navigate to="/login" />} />
				<Route path="/friends" element={isAdmin() ? <FriendsPage /> : <Navigate to="/login" />} />
				<Route path="/leaderboard" element={isAdmin() ? <LeaderboardPage /> : <Navigate to="/login" />} />
				<Route path="*" element={<ErrorPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
