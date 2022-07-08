import axios from 'axios';

const getUserData = async () => {
	const response = await axios.get('/users/me');
	return response.data;
};

export default getUserData;
