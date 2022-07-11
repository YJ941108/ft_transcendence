export const setAdmin = (token: string) => {
	if (token) localStorage.setItem('isAdmin', JSON.stringify(true));
};
