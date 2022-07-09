import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesRepository } from './games.repository';

@Injectable()
export class GamesService {
  constructor(@InjectRepository(GamesRepository) private gamesRepository: GamesRepository) {}
}
