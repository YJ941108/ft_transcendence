const isAdmin = () => {
	return !!localStorage.getItem('token');
};

export default isAdmin;
