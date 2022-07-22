import { IsNotEmpty } from 'class-validator';

export class ActionFriendsDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  action: string;
}
