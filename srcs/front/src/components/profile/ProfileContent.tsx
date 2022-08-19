import React from 'react';
import styled from 'styled-components';

const ProfileContentBox = styled.div`
	grid-area: ProfileContent;
	width: 100%;
	display: block;
	border: 1px dashed white;
	padding: 20px;
	box-sizing: border-box;
	border-radius: 10px;
	color: white;
`;

function ProfileContent() {
	return <ProfileContentBox>여기에 랭킹 상황표시.</ProfileContentBox>;
}

export default ProfileContent;
