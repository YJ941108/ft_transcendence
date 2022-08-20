import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import axios from 'axios';
import { useQuery } from 'react-query';
import { getUserData } from '../../modules/api';
import { IUser } from './UserInterface';
import '../styles/Modal.css';

const ModalStyledDiv = styled.div`
	display: grid;
	align-items: center;
	grid-template-columns: 1fr 2fr;
	padding: 20px;
	grid-gap: 20px;
	width: 100%;
	height: 100%;
	grid-template-areas:
		'imgBody formBody formBody'
		'editBtn editBtn editBtn';
`;

function ProfileModal() {
	const { data } = useQuery<IUser>('user', getUserData);
	const [show, setShow] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [inputPhoto, setInputPhoto] = useState('');
	const [previewPhoto, setPreviewPhoto] = useState('');

	useEffect(() => {
		if (data?.photo) setPreviewPhoto(data.photo);
	}, []);
	const handleFile = (e: any) => {
		setInputPhoto(e.target.files[0]);
		setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
	};
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append('nickname', inputValue);
		formData.append('file', inputPhoto);
		if (inputValue || inputPhoto)
			await axios
				.post('/api/users/me', formData)
				.then((res) => {
					alert(res.data.message);
					handleClose();
					setInputValue('');
					setInputPhoto('');
					return res;
				})
				.catch((err) => {
					const errorMsg = err.response.data.message;
					alert(errorMsg);
					console.clear();
				});
		else alert('수정을 위해 입력을 해주세요.');
	};
	return (
		<div>
			<Button variant="info" onClick={handleShow}>
				User Edit
			</Button>

			<Modal className="custom_modal" show={show} onHide={handleClose} centered>
				<Modal.Header>
					<Modal.Title>Profile Edit</Modal.Title>
				</Modal.Header>
				<ModalStyledDiv>
					<img src={previewPhoto} alt="profile_photo" className="custom_modal_img" />
					<div className="formDiv">
						<form onSubmit={handleSubmit}>
							<div>
								<label htmlFor="nickName">
									<div>현재 아이디 : {data?.nickname}</div>
									<input
										type="text"
										id="nickName"
										placeholder="수정할 이름을 입력해주세요!"
										onChange={(e) => setInputValue(e.target.value)}
									/>
								</label>
							</div>
							<div>
								<label htmlFor="file">
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											handleFile(e);
										}}
									/>
								</label>
							</div>
						</form>
					</div>
					<Button className="editButton" onClick={handleSubmit}>
						Save Change
					</Button>
				</ModalStyledDiv>
			</Modal>
		</div>
	);
}

export default ProfileModal;
