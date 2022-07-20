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
  readonly winner_id: number;

  @IsOptional()
  @IsInt()
  readonly loser_id: number;

  @IsOptional()
  @IsInt()
  readonly winner_score: number;

  @IsOptional()
  @IsInt()
  readonly loser_score: number;

  @IsOptional()
  @IsString()
  readonly created_at: Date;

  @IsOptional()
  @IsString()
  readonly ended_at: Date;

  @IsOptional()
  @IsInt()
  readonly game_duration: number;

  @IsOptional()
  @IsInt()
  readonly mode: GameMode;
}
