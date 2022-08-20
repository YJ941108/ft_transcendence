export interface IUser {
	access_token: string;
	created_at: string;
	email: string;
	nickname: string;
	photo: string;
	wins: number;
	losses: number;
	ratio: number;
	achievement: boolean[];
	updated_at: string;
	username: string;
	friends: number[];
	friends_blocked: number[];
	friends_request: number[];
	tfa: boolean;
	id: number;
	jwt: string;
	refresh_token: string;
}
