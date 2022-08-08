import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessageService } from './direct-message.service';
import { DirectMessage } from './entities/direct-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage])],
  providers: [DirectMessageService],
  exports: [DirectMessageService],
})
export class DirectMessageModule {}
