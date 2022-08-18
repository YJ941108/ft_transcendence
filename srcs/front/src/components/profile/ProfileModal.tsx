import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import axios from 'axios';
import { getUserData } from '../../modules/api';
import { IUser } from './UserInterface';

const ModalStyledDiv = styled.div`
	display: grid;
	padding: 10px;
	width: 100%;
	height: 100%;
	grid-template-columns: 1fr 4fr;
	grid-template-areas: '
	imgBody formBody
	';
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
		setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
		setInputPhoto(e.target.files[0]);
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
					<Modal.Body className="custom_modal_img_body">
						<img src={previewPhoto} alt="profile_photo" className="custom_modal_img" />
					</Modal.Body>
					<Modal.Body className="custom_modal_form_body">
						<div>
							<form onSubmit={handleSubmit}>
								<div>
									<label htmlFor="nickName">
										Nick Name:
										<input
											type="text"
											id="nickName"
											placeholder={data?.nickname}
											onChange={(e) => setInputValue(e.target.value)}
										/>
									</label>
								</div>
								<div>
									<label htmlFor="file">
										Default file input example
										<input
											type="file"
											id="file"
											onChange={(e) => {
												handleFile(e);
											}}
										/>
									</label>
								</div>
							</form>
						</div>
						<Button variant="success" onClick={handleSubmit}>
							Save Change
						</Button>
					</Modal.Body>
				</ModalStyledDiv>
			</Modal>
		</div>
	);
}

export default ProfileModal;
