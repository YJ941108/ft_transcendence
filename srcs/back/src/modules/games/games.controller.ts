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
    const users = await this.gamesService.find(id);
    users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return users;
  }
}
