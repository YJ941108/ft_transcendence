import { atom } from 'recoil';

const userData = atom({
	key: 'userData', // unique ID (with respect to other atoms/selectors)
	default: {}, // default value (aka initial value)
});

export default userData;
