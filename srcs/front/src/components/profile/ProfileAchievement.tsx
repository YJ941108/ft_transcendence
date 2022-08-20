import React from 'react';
import styled from 'styled-components';

type Props = {
	achievement: boolean[];
};

const ProfileAchievementBox = styled.div`
	width: 100%;
	display: grid;
	grid-gap: 1rem;
	padding: 1rem;
	grid-template-areas:
		'title title title'
		'winDiv loseDiv ratioDiv';
`;

const achieveBox = {
	background: 'darkgreen',
	border: '3px solid yellowgreen',
	opacity: '1',
	transition: 'opacity 3s 2s',
};

function ProfileAchievement({ achievement }: Props) {
	return (
		<ProfileAchievementBox>
			<div className="contentTitle">MY ACHIEVEMENT</div>
			<div className="myAchievement" id="firstLogin" style={achievement[0] ? achieveBox : undefined}>
				<img src="/img/firstLogin.png" alt="achievementIcon" />
			</div>
			<div className="myAchievement" id="firstFriend" style={achievement[1] ? achieveBox : undefined}>
				<img src="/img/firstFriend.png" alt="achievementIcon" />
			</div>
			<div className="myAchievement" id="firstWin" style={achievement[2] ? achieveBox : undefined}>
				<img src="/img/firstWin.png" alt="achievementIcon" />
			</div>
		</ProfileAchievementBox>
	);
}

export default ProfileAchievement;
