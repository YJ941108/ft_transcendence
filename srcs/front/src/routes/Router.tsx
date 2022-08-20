import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import UsersPage from './pages/UsersPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ErrorPage from './pages/ErrorPage';
import TfaPage from './pages/TfaPage';
import AnotherProfilePage from './pages/AnotherProfilePage';

function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/tfa" element={<TfaPage />} />
				<Route path="/main" element={<MainPage />}>
					<Route path="game" element={<GamePage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="another/:nickname" element={<AnotherProfilePage />} />
					<Route path="leaderboard" element={<LeaderboardPage />} />
				</Route>
				<Route path="*" element={<ErrorPage />} />
				<Route path="/users" element={<UsersPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
