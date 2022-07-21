import { EntityRepository, Repository } from 'typeorm';
import { Game } from './games.entity';

/**
 *
 */
@EntityRepository(Game)
export class GamesRepository extends Repository<Game> {}
