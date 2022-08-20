import React from 'react';
import styled from 'styled-components';

const ListSectionStyleC = styled.li`
	background-color: ${(props) => props.theme.darkGray};
	padding: 5px;
`;

interface IListSection {
	title: string;
}

function ListSection({ title }: IListSection) {
	return <ListSectionStyleC>{title}</ListSectionStyleC>;
}

export default ListSection;
