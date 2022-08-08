// import React from 'react';
import { Socket } from 'socket.io-client';
import { IDMRoomInfo } from '../../modules/Interfaces/chatInterface';

interface IDebug {
	func: string;
	code: number;
	message: string;
}

export const emitCreateDMRoom = (chatSocket: Socket, anotherId: number) => {
	chatSocket.emit('createDMRoom', { anotherId }, (response: IDMRoomInfo) => {
		if (response.code === 200) {
			console.log('emitCreateDMRoom SUCCESS', response.data);
		} else if (response.code === 400) {
			console.log('emitCreateDMRoom FAIL', response);
		}
	});
};

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

export const emitSendDMMessage = (chatSocket: Socket, DMId: number, authorId: number, message: string) => {
	chatSocket.emit('sendDMMessage', { DMId, authorId, message }, (response: IDebug) => {
		if (response.code === 200) {
			console.log('sendDMMessage SUCCESS', response);
		} else if (response.code === 400) {
			console.log('sendDMMessage FAIL', response);
		}
	});
};
