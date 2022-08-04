export default interface IUserData {
	id: number;
	username: string;
	email: string;
	nickname: string;
	photo: string;
	tfa: boolean;
	tfaCode: boolean;
	isFriend: boolean;
	wins: number;
	losses: number;
	ratio: number;
	socketId: string;
	achievement: number;
	createdAt: string;
	updatedAt: string;
}
