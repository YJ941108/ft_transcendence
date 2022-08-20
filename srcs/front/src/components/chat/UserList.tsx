import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import UserInfo from './li-AllUser';
import { chatUserList, MyInfo } from '../../modules/atoms';
import IUserData from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import MyUserInfo from './li-MyInfo';

const UserListStyleC = styled.ul`
	min-height: 800px;
	max-height: 800px;
	overflow-y: scroll;
	background-color: black;
`;

function UserList() {
	const chatSocket = useChatSocket();
	const [users, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const info = useRecoilValue(MyInfo);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningGetUsers', (response: { data: IUserData[] }) => {
				setUsers(response.data);
			});
			return () => {
				chatSocket.off('listeningGetUsers');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<UserListStyleC>
			<MyUserInfo key={info.id} id={info.id} nickname={info.nickname} photo={info.photo} />
			{users?.map((element: IUserData) => {
				if (element.id !== info.id) {
					return (
						<UserInfo
							key={element.id}
							id={element.id}
							nickname={element.nickname}
							photo={element.photo}
							chatSocket={chatSocket}
							isOnline={element.isOnline}
						/>
					);
				}
				return null;
			})}
		</UserListStyleC>
	);
}

export default UserList;
