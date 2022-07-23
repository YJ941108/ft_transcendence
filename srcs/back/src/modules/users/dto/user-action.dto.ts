import { IsNotEmpty } from 'class-validator';

export class UserActionDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  action: string;
}
