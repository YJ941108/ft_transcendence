import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './class/user.class';
import { Games } from './games.entity';
import { GamesService } from './games.service';

@Controller('games')
@UseGuards(AuthGuard())
export class GamesController {
  constructor(private gamesService: GamesService) {}

  /**
   * 유저 정보 반환
   * @param req
   * @returns
   */
  @Get()
  async findAll(): Promise<Games[]> {
    const users = await this.gamesService.findAll();
    return users;
  }

  /**
   * 유저 정보 반환
   * @param req
   * @returns
   */
  @Get(':id')
  async findbyUsers(@Param('id') id: number): Promise<Games[]> {
    const games = await this.gamesService.find(id);
    games.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    let response = [];

    for (let i = 0; i < games.length; i++) {
      const winnerId = games[i].winnerId;
      const loserId = games[i].loserId;
      const winner = games[i].players.find((value) => value.id === winnerId);
      const loser = games[i].players.find((value) => value.id === loserId);

      response.push({
        id: id,
        winner: winner,
        loser: loser,
        createdAt: games[i].createdAt,
      });
    }

    return response;
  }
}
