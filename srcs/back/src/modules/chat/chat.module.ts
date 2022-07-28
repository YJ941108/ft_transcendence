import { Module } from '@nestjs/common';
import { ChannelModule } from '../channel/channel.module';
import { DirectMessageModule } from '../direct-message/direct-message.module';
import { MessageModule } from '../message/message.module';
import { UsersModule } from '../users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ChannelModule, DirectMessageModule, MessageModule, UsersModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
