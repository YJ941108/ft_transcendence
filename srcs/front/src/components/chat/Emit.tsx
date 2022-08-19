// import React from 'react';
import { Socket } from 'socket.io-client';
import { IDMRoomList } from '../../modules/Interfaces/chatInterface';

interface IDebug {
	func: string;
	code: number;
	message: string;
}

export const emitCreateDMRoom = (chatSocket: Socket, anotherId: number) => {
	chatSocket.emit('createDMRoom', { anotherId }, (response: IDMRoomList) => {
		if (response.code === 200) {
			console.log('emitCreateDMRoom SUCCESS');
		} else if (response.code === 400) {
			console.log('emitCreateDMRoom FAIL');
		}
	});
};

export const emitJoinDMRoom = (chatSocket: Socket, DMId: number) => {
	chatSocket.emit('createDMRoom', { DMId }, (response: IDMRoomList) => {
		if (response.code === 200) {
			console.log('emitJoinDMRoom SUCCESS');
		} else if (response.code === 400) {
			console.log('emitJoinDMRoom FAIL');
		}
	});
};

export const emitJoinChat = (chatSocket: Socket, id: number, nickname: string) => {
	chatSocket.emit('joinChat', { id, nickname }, (response: IDebug) => {
		if (response.code === 200) {
			console.log(nickname, 'emitJoinChat SUCCESS');
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

export const emitSendPongInvite = (chatSocket: Socket, anotherId: number) => {
	chatSocket.emit('sendPongInvite', { anotherId }, (response: IDebug) => {
		if (response.code === 200) {
			console.log('sendPongInvite SUCCESS', response);
		} else if (response.code === 400) {
			console.log('sendPongInvite FAIL', response);
		}
	});
};

export const emitAcceptPongInvite = (chatSocket: Socket, roomId: string, messageId: number) => {
	chatSocket.emit('acceptPongInvite', { roomId, messageId }, (response: IDebug) => {
		if (response.code === 200) {
			console.log('acceptPongInvite SUCCESS', response);
		} else if (response.code === 400) {
			console.log('acceptPongInvite FAIL', response);
		}
	});
};
