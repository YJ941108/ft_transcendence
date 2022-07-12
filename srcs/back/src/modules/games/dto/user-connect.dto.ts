import { IsNotEmpty } from 'class-validator';

export class UserConnectDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  nickname: string;
}
