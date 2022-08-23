import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import UserInfo from './li-AllUser';
import { chatUserList, MyInfo } from '../../modules/atoms';
import IUserData from '../../modules/Interfaces/userInterface';
import { useChatSocket } from './SocketContext';
import MyUserInfo from './li-MyInfo';
import ListSection from './ListSection';

const UserListStyleC = styled.ul`
	min-height: 800px;
	max-height: 800px;
	overflow-y: scroll;
	background-color: black;
`;

function UserList() {
	const chatSocket = useChatSocket();
	const navigate = useNavigate();
	const [users, setUsers] = useRecoilState<IUserData[]>(chatUserList);
	const info = useRecoilValue(MyInfo);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningGetUsers', (response: { data: IUserData[] }) => {
				setUsers(response.data);
			});
			chatSocket.on('listeningSpectateRoom', () => {
				console.log('here?');
				const url = window.location.href.split('/').pop();
				if (url !== 'game') {
					navigate('/main/game');
				} else {
					window.location.reload();
				}
			});
			return () => {
				chatSocket.off('listeningGetUsers');
				chatSocket.off('listeningGetUsers');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<UserListStyleC>
			<ListSection title="MY INFO" />
			<MyUserInfo key={info.id} user={info} />
			<ListSection title="ONLINE" />
			{users?.map((element: IUserData) => {
				if (element.id !== info.id && element.isOnline) {
					return <UserInfo key={element.id} user={element} />;
				}
				return null;
			})}
			<ListSection title="OFFLINE" />
			{users?.map((element: IUserData) => {
				if (element.id !== info.id && !element.isOnline) {
					return <UserInfo key={element.id} user={element} />;
				}
				return null;
			})}
		</UserListStyleC>
	);
}

export default UserList;
