import React from 'react';
import { useSetRecoilState } from 'recoil';
import { chatContent } from '../../../modules/atoms';

function OpenChatNewButton() {
	const setContent = useSetRecoilState(chatContent);
	return (
		<button type="button" onClick={() => setContent('NewOpenChatRoom')}>
			+Group
		</button>
	);
}

export default OpenChatNewButton;
