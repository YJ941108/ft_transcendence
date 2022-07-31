import React from 'react';
import styled from 'styled-components';

const FriendsListStyleC = styled.ul`
	background-color: red;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
`;
function FriendsList() {
	return <FriendsListStyleC />;
}

export default FriendsList;
