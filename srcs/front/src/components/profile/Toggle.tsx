import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import axios from 'axios';

interface Props {
	tfa: boolean | undefined;
}

const ToggleBtn = styled.button`
	width: 60px;
	height: 30px;
	border-radius: 30px;
	border: none;
	cursor: pointer;
	float: right;
	background-color: ${(props: Props) => (props.tfa ? 'green' : 'darkgray')};
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
		props.tfa &&
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

function Toggle({ tfa }: Props) {
	const [toggle, setToggle] = useState(tfa);
	const clickedToggle = () => {
		setToggle((prev) => !prev);
	};
	const didMount = React.useRef(false);

	useEffect(() => {
		if (didMount.current) {
			axios
				.patch('/api/users/me/tfa', { tfa: toggle })
				// eslint-disable-next-line no-alert
				.then((r) => (r.data.tfa ? alert('2차인증이 활성화 되었습니다.') : alert('2차인증이 비활성화 되었습니다.')));
		} else didMount.current = true;
	}, [toggle]);

	return (
		<ToggleBox>
			{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
			<label>2AF 인증 {toggle ? 'On' : 'Off'}</label>
			<ToggleBtn onClick={clickedToggle} tfa={toggle}>
				<Circle tfa={toggle} />
			</ToggleBtn>
		</ToggleBox>
	);
}

export default Toggle;
