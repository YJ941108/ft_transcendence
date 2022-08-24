const isAdmin = () => {
	if (!!localStorage.getItem('token') && localStorage.getItem('isTfa') === 'false') {
		return true;
	}
	if (
		!!localStorage.getItem('token') &&
		localStorage.getItem('isTfa') === 'true' &&
		localStorage.getItem('isTfaSucceed') === 'true'
	) {
		return true;
	}
	if (
		!!localStorage.getItem('token') &&
		localStorage.getItem('isTfa') === 'true' &&
		localStorage.getItem('isTfaSucceed') === 'false'
	) {
		return false;
	}
	return false;
};

export default isAdmin;
