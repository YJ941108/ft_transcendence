import React from 'react';
import styled from 'styled-components';
import { IUser } from './UserInterface';
import ProfileAchievement from './ProfileAchievement';
import ProfileHistory from './ProfileHistory';
import '../styles/ProfileContent.css';
import ProfileMatchHistory from './ProfileMatchHistory';

type Props = {
	data: IUser | undefined;
};

const ProfileContentBox = styled.div`
	grid-area: ProfileContent;
	display: grid;
`;

function ProfileContent({ data }: Props) {
	return (
		<ProfileContentBox>
			<ProfileHistory wins={data?.wins} losses={data?.losses} ratio={data?.ratio} />
			<ProfileAchievement achievement={data!.achievement} />
			<ProfileMatchHistory id={data!.id} />
		</ProfileContentBox>
	);
}

export default ProfileContent;
