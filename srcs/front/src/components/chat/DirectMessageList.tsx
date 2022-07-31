import React from 'react';
import styled from 'styled-components';

const DirectMessageListC = styled.ul`
	list-style: none;
	width: 100%;
	min-height: 600px;
	max-height: 600px;
	padding: 5px;
	vertical-align: baseline;
	box-sizing: border-box;
	overflow-y: scroll;
`;

// interface IDirectMessageListProps {}

function DirectMessageList() {
	return <DirectMessageListC />;
}

export default DirectMessageList;
