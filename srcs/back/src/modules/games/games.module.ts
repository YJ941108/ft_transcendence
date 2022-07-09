import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { GamesRepository } from './games.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GamesRepository])],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
