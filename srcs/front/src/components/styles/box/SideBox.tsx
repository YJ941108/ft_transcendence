import React from 'react';
import styled from 'styled-components';

interface ISideBoxProps {
	children?: React.ReactNode;
}

const SideBoxC = styled.div`
	width: 20%;
`;

export default function SideBox({ children }: ISideBoxProps) {
	return <SideBoxC>{children}</SideBoxC>;
}
