import axios from 'axios';

const getUserData = async () => {
	const response = await axios.get('/api/users/me');
	return response.data;
};

export default getUserData;
