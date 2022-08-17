import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { getUserData } from '../../modules/api';
import IUserData from '../../modules/Interfaces/userInterface';

function Tfa() {
	const { isLoading, data, error } = useQuery<IUserData>('user', getUserData);
	const [inputs, setInputs] = useState({
		code0: '',
		code1: '',
		code2: '',
		code3: '',
		code4: '',
		code5: '',
	});

	useEffect(() => {
		const patchCode = async () => {
			const response = await axios.patch('/api/users/me/tfa');
			console.log(response, 'res');
			if (response.data.tfaCode === false) {
				console.log(response.data.tfaCode, 'patchCode');
				return <Navigate to="/game" />;
			}
			return null;
		};
		if (data) patchCode();
	}, [data]);

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const codes = inputs.code0 + inputs.code1 + inputs.code2 + inputs.code3 + inputs.code4 + inputs.code5;
		const response = await axios.post(`/api/users/me/tfa/${codes}`);
		console.log(response, 'res');
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

	if (isLoading) return <h1>loading</h1>;
	if (error) return <h1>error</h1>;
	if (data && data.tfa)
		return (
			<div>
				<form onSubmit={onSubmit}>
					<div>
						<input name="code0" value={inputs.code0} maxLength={1} onChange={handleChange} />
						<span>-</span>
						<input name="code1" value={inputs.code1} maxLength={1} onChange={handleChange} />
						<span>-</span>
						<input name="code2" value={inputs.code2} maxLength={1} onChange={handleChange} />
						<span>-</span>
						<input name="code3" value={inputs.code3} maxLength={1} onChange={handleChange} />
						<span>-</span>
						<input name="code4" value={inputs.code4} maxLength={1} onChange={handleChange} />
						<span>-</span>
						<input name="code5" value={inputs.code5} maxLength={1} onChange={handleChange} />
					</div>
				</form>
			</div>
		);
	return <Navigate to="/game" />;
}

export default Tfa;
