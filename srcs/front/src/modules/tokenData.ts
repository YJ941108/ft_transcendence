import { atom } from 'recoil';

const tokenData = atom({
	key: 'tokenData', // unique ID (with respect to other atoms/selectors)
	default: '', // default value (aka initial value)
});

export default tokenData;
