import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channel/entities/channel.entity';
import { UsersModule } from '../users/users.module';
import { Punishment } from './entities/punishment.entity';
import { PunishmentService } from './punishment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Punishment, Channel]), UsersModule],
  providers: [PunishmentService],
  exports: [PunishmentService],
})
export class PunishmentModule {}
