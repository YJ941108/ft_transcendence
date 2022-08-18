import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { getUserData } from '../../modules/api';
import IUserData from '../../modules/Interfaces/userInterface';

function Tfa() {
	const { isLoading, data, error } = useQuery<IUserData>('user', getUserData);
	const [input, setInput] = useState('');
	const [isTfa, setIsTfa] = useState(true);
	const [isTfaSucceed, setIsTfaSucceed] = useState(false);

	useEffect(() => {
		if (data?.tfa === false) {
			setIsTfa(false);
		}
	}, [data]);

	const getTfaCode = () => {
		axios.post('/api/users/me/tfa');
	};

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const codes = input;
		await axios
			.get(`/api/users/me/tfa/${codes}`)
			.then(() => {
				setIsTfaSucceed(true);
			})
			.catch(() => alert('Invalid code'));
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setInput(value);
	};

	const onClickReset = () => {
		setInput('');
	};

	if (isLoading) return <h1>loading</h1>;
	if (error) return <h1>error</h1>;
	if (!isTfa || isTfaSucceed) return <Navigate to="/game" />;
	return (
		<div>
			<button type="button" onClick={getTfaCode}>
				get TFA code
			</button>
			<form onSubmit={onSubmit}>
				<div>
					<input name="code" value={input} minLength={4} maxLength={4} onChange={handleChange} />
					<button type="submit">submit</button>
					<button type="button" onClick={onClickReset}>
						reset
					</button>
				</div>
			</form>
		</div>
	);
}

export default Tfa;
