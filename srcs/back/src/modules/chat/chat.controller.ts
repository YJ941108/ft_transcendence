import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard())
export class ChatController {
  private logger = new Logger('UsersController');

  constructor(private chatService: ChatService) {}

  @Get('channel/:param')
  async getChannelMessage(@Param('param') param: string): Promise<Object> {
    const channelId = Number(param);
    let response: Object = {
      func: 'getChannelMessage',
      code: 400,
      message: '채널 번호가 틀립니다.',
    };

    try {
      const channel = await this.chatService.getChannelData(channelId);
      response = {
        func: 'getChannelMessage',
        code: 200,
        message: '채널 정보를 전송했습니다.',
        data: channel,
      };
      return response;
    } catch (e) {
      this.logger.log(e);
      this.logger.log(response);
      return response;
    }
  }
}
