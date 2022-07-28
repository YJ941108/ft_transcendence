import React, { useState } from 'react';
import styled, { css } from 'styled-components';

interface Props {
	toggle: boolean;
}

const ToggleBtn = styled.button`
	width: 60px;
	height: 30px;
	border-radius: 30px;
	border: none;
	cursor: pointer;
	float: right;
	background-color: ${(props: Props) => (!props.toggle ? 'darkgray' : 'green')};
	display: block;
	justify-content: center;
	align-items: center;
	transition: all 0.5s ease-in-out;
`;
const Circle = styled.div`
	background-color: white;
	width: 20px;
	height: 20px;
	border-radius: 50px;
	left: 2%;
	transition: all 0.5s ease-in-out;
	${(props: Props) =>
		props.toggle &&
		css`
			transform: translate(30px, 0);
			transition: all 0.5s ease-in-out;
		`}
`;

const ToggleBox = styled.div`
	margin-top: 20px;
	padding: 10px;
	width: 200px;
	column-count: 2;
	line-height: 30px;
`;

function Toggle() {
	const [toggle, setToggle] = useState(false);
	const clickedToggle = () => {
		setToggle((prev: boolean) => !prev);
	};
	return (
		<ToggleBox>
			{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
			<label>2AF 인증 {!toggle ? 'Off' : 'On'}</label>
			<ToggleBtn onClick={clickedToggle} toggle={toggle}>
				<Circle toggle={toggle} />
			</ToggleBtn>
		</ToggleBox>
	);
}

export default Toggle;
