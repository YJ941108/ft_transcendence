import React from 'react';
import styled from 'styled-components';

const ProfileContentBox = styled.div`
	grid-area: ProfileContent;
	width: 100%;
	display: block;
	border: 3px solid white;
	padding: 20px;
	box-sizing: border-box;
	color: black;
`;

// interface IUser {
// 	access_token: string;
// 	created_at: string;
// 	email: string;
// 	nickname: string;
// 	photo: string;
// 	updated_at: string;
// 	username: string;
// 	friends: number[];
// 	friends_blocked: number[];
// 	friends_request: number[];
// 	id: number;
// 	jwt: string;
// 	refresh_token: string;
// }

function ProfileContent() {
	return <ProfileContentBox>여기에 랭킹 상황표시.</ProfileContentBox>;
}

export default ProfileContent;
