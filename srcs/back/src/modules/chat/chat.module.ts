import { Module } from '@nestjs/common';
import { ChannelModule } from '../channel/channel.module';
import { DirectMessageModule } from '../direct-message/direct-message.module';
import { GamesModule } from '../games/games.module';
import { MessageModule } from '../message/message.module';
import { UsersModule } from '../users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ChannelModule, DirectMessageModule, MessageModule, UsersModule, GamesModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
