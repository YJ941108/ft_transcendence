import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { GamesRepository } from './games.repository';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

/**
 *
 */
@Module({
  imports: [TypeOrmModule.forFeature([GamesRepository]), UsersModule, AuthModule],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
  exports: [GamesGateway],
})
export class GamesModule {}
