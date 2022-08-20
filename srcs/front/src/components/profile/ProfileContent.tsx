import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getUserData } from '../../modules/api';
import { IUser } from './UserInterface';
import ProfileAchievement from './ProfileAchievement';
import ProfileHistory from './ProfileHistory';
import '../styles/ProfileContent.css';

const ProfileContentBox = styled.div`
	grid-area: ProfileContent;
	display: grid;
	grid-template-rows: repeat(3, 1fr);
`;

function ProfileContent() {
	const { isLoading, data, error } = useQuery<IUser>('user', getUserData);
	if (isLoading || error) return null;
	return (
		<ProfileContentBox>
			<ProfileHistory wins={data?.wins} losses={data?.losses} ratio={data?.ratio} />
			<ProfileAchievement achievement={data!.achievement} />
		</ProfileContentBox>
	);
}

export default ProfileContent;
