import React, { ChangeEvent, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import axios from 'axios';
import getUserData from '../../modules/api';
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
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);
	const handleSubmit = async () => {
		await axios
			.post('/api/users/me', { nickname: inputValue })
			.then((res) => {
				alert('닉네임 수정이 완료되었습니다.');
				handleClose();
				return res;
			})
			.catch((err) => {
				const errorStatus = err.response.data.statusCode;
				if (errorStatus === 409) alert('아이디가 중복되었습니다.확인해주세요.');
				else if (errorStatus === 400) alert('입력창에 입력을 해주세요.');
				else console.log(err, 'err');
			});
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
						<img src={data?.photo} alt="profile_photo" className="custom_modal_img" />
						<div id="result" />
					</Modal.Body>
					<Modal.Body className="custom_modal_form_body">
						<Form onSubmit={handleSubmit}>
							<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
								<Form.Label>Nick Name</Form.Label>
								<input placeholder={data?.nickname} onChange={(e) => handleChange(e)} />
							</Form.Group>
						</Form>
						<Button onClick={handleClose}>image upload</Button>
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
