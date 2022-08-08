// import React from 'react';
import { Socket } from 'socket.io-client';

interface IDebug {
	func: string;
	code: number;
	message: string;
}

export const emitJoinChat = (chatSocket: Socket, id: number, nickname: string) => {
	chatSocket.emit('joinChat', { id, nickname }, (response: IDebug) => {
		if (response.code === 200) {
			console.log(nickname, 'emitJoinChat SUCCESS', response);
		} else if (response.code === 400) {
			console.log('emitJoinChat FAIL', nickname, response);
		}
	});
};

export const emitUserAction = (chatSocket: Socket, who: string, action: string) => {
	chatSocket.emit('userAction', { who, action }, (response: IDebug) => {
		if (response.code === 200) {
			console.log('emitUserAction SUCCESS', who, action, response);
		} else if (response.code === 400) {
			console.log('emitUserAction FAIL', who, action, response);
		}
	});
};
