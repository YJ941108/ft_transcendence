import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import UserInfo from './UserInfo';
import { chatUserList } from '../../modules/atoms';
import IUser from '../../modules/Interfaces/userInterface';

const UserListStyleC = styled.ul`
	/* min-height: 600px; */
	/* max-height: 600px; */
	height: 92%;
	overflow-y: scroll;
	background-color: black;
	border-left: 2px solid white;
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
// 	tfa: boolean;
// 	id: number;
// 	jwt: string;
// 	refresh_token: string;
// }

function UserList({ chatSocket }: any) {
	const [users, setUsers] = useRecoilState<IUser[]>(chatUserList);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningGetUsers', (response: { data: IUser[] }) => {
				setUsers(response.data);
			});
		}
	}, [chatSocket]);
	return (
		<UserListStyleC>
			{users?.map((element: IUser) => {
				return <UserInfo key={element.id} nickname={element.nickname} photo={element.photo} />;
			})}
		</UserListStyleC>
	);
}

export default UserList;
