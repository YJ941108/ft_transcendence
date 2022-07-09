import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';

@Module({
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
