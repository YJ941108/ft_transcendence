import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './game.entity';
import { GamesRepository } from './games.repository';

/**
 *
 */
@Injectable()
export class GamesService {
  /**
   *
   * @param gamesRepository
   */
  constructor(@InjectRepository(GamesRepository) private gamesRepository: GamesRepository) {}

  /**
   *
   * @returns
   */
  async findAll() {
    return this.gamesRepository.find({});
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<Game> {
    const game = await this.gamesRepository.findOne(id);
    if (!game) {
      throw new NotFoundException(`Game [${id}] not found`);
    }
    return game;
  }

  /**
   *
   * @param createGameDto
   * @returns
   */
  async create(createGameDto: CreateGameDto): Promise<Game> {
    const game = this.gamesRepository.create({ ...createGameDto });
    return this.gamesRepository.save(game);
  }

  /**
   *
   * @param id
   * @param updateGameDto
   * @returns
   */
  async update(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.gamesRepository.preload({
      id: +id,
      ...updateGameDto,
    });
    if (!game) {
      throw new NotFoundException(`Cannot update game[${id}]: Not found`);
    }
    return this.gamesRepository.save(game);
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number): Promise<Game> {
    const game = await this.findOne(id);
    return this.gamesRepository.remove(game);
  }
}
