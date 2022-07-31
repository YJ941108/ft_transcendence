import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getUsersData } from '../../modules/api';
import UserInfo from './UserInfo';

const AllUserListStyleC = styled.ul`
	width: 100%;
	width: 300px;
	min-height: 600px;
	max-height: 600px;
	overflow-y: scroll;
	background-color: #5f5f5f;
`;

function AllUserList() {
	const { isLoading, data } = useQuery('users', getUsersData);
	// data?.map((element: any) => console.log(element.nickname));

	if (isLoading) return <h1>Loading...</h1>;
	return (
		<AllUserListStyleC>
			{data?.map((element: any) => {
				return <UserInfo key={element.id} nickname={element.nickname} photo={element.photo} />;
			})}
		</AllUserListStyleC>
	);
}

export default AllUserList;
