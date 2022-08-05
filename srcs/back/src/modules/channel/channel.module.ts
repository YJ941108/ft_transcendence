import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PunishmentModule } from '../punishment/punishment.module';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), PunishmentModule],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
