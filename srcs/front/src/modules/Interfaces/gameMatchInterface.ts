import IUser from './userInterface';

export interface IMatch {
	id: number;
	winner: IUser;
	loser: IUser;
}
