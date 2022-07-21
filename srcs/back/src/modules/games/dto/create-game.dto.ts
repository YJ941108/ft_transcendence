import { IsString, IsOptional, IsInt } from 'class-validator';
import { Users } from '../../users/users.entity';
import { GameMode } from '../../../enums/games.enum';

/**
 * @see https://github.com/typestack/class-validator
 */
export class CreateGameDto {
  readonly players: Users[];

  @IsOptional()
  @IsInt()
  readonly winnerId: number;

  @IsOptional()
  @IsInt()
  readonly loserId: number;

  @IsOptional()
  @IsInt()
  readonly winnerScore: number;

  @IsOptional()
  @IsInt()
  readonly loserScore: number;

  @IsOptional()
  @IsString()
  readonly createdAt: Date;

  @IsOptional()
  @IsString()
  readonly endedAt: Date;

  @IsOptional()
  @IsInt()
  readonly gameDuration: number;

  @IsOptional()
  @IsInt()
  readonly mode: GameMode;
}
