import React from 'react';
import styled from 'styled-components';

const TopBarStyledC = styled.div`
	height: 100px;
	width: 100%;
	display: flex;
	justify-content: center;
	vertical-align: middle;
	/* text-align: center; */
	border-bottom: 3px solid white;
`;

function TopBar() {
	return <TopBarStyledC>TOP BAR</TopBarStyledC>;
}

export default TopBar;
