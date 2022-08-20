import React from 'react';
import styled from 'styled-components';
import { IUser } from './UserInterface';
import ProfileAchievement from './ProfileAchievement';
import ProfileHistory from './ProfileHistory';
import '../styles/ProfileContent.css';

type Props = {
	data: IUser | undefined;
};

const ProfileContentBox = styled.div`
	grid-area: ProfileContent;
	display: grid;
	grid-template-rows: repeat(3, 1fr);
`;

function ProfileContent({ data }: Props) {
	return (
		<ProfileContentBox>
			<ProfileHistory wins={data?.wins} losses={data?.losses} ratio={data?.ratio} />
			<ProfileAchievement achievement={data!.achievement} />
		</ProfileContentBox>
	);
}

export default ProfileContent;
