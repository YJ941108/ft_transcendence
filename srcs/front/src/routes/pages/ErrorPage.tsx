import React from 'react';
import styled from 'styled-components';

const ErrorBox = styled.div`
	line-height: 100%;
	img {
		width: 50%;
		margin: auto;
		display: flex;
		align-items: center;
		align-content: center;
		z-index: -1;
	}
	h1 {
		text-align: center;
		z-index: 1;
		font-family: RetroGaming;
		line-height: 5rem;
		font-size: 5rem;
	}
`;

function ErrorPage() {
	return (
		<ErrorBox>
			<h1>ErrorPage</h1>
			<img src="/img/errorImg.jpg" alt="error" />
		</ErrorBox>
	);
}

export default ErrorPage;
