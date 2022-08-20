import React from 'react';
import styled from 'styled-components';
import Toggle from './Toggle';
import ProfileModal from './ProfileModal';
import { IUser } from './UserInterface';

type Props = {
	data: IUser | undefined;
	show: boolean;
};

const RootStyled = styled.div`
	grid-area: ProfileCard;
	text-align: center;
	padding: inherit;
	height: 100%;
	a {
		display: block;
		padding: 20px;
		margin-top: 20px;
		cursor: pointer;
	}
`;

const ProfileCardBox = styled.div`
	border: 1px solid white;
	display: inline-block;
	color: white;
	padding: 20px;
	width: 188px;
	border-radius: 10px;
	text-align: center;
	cursor: default;
	h1 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
		font-size: 1.2rem;
		margin-top: 20px;
	}
	img {
		object-fit: cover;
		border-radius: 50%;
		width: 150px;
		height: 150px;
		margin-bottom: 0.4rem;
		background-color: white;
	}
`;

function ProfileCard({ data, show }: Props) {
	return (
		<RootStyled>
			<ProfileCardBox>
				<img src={data?.photo} alt="profile" />
				<h1>{data?.nickname}</h1>
				<div hidden={show}>
					<ProfileModal />
				</div>
			</ProfileCardBox>
			<Toggle tfa={data?.tfa} show={show} />
		</RootStyled>
	);
}

export default ProfileCard;
