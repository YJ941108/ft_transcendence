import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Users } from './entities/users.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * @decorator WebSocketGateway
 * @class OnGatewayInit
 * @class OnGatewayConnection
 * @class OnGatewayDisconnect
 */
@WebSocketGateway({
  cors: {
    origin: 'http://3.39.20.24:3031',
    methods: ['GET', 'POST'],
  },
  namespace: 'api/users',
})
export class UsersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  /** Logger */
  private logger: Logger = new Logger('UsersGateway');

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  /** @type server */
  @WebSocketServer()
  server: Server;

  /**
   * 소켓이 만들어질 때 실행
   * @function
   * @param server 서버 소켓
   */
  afterInit(server: any) {
    this.logger.log(`afterInit: ${server.name} 초기화`);
  }

  /**
   * 클라이언트가 홈페이지에 접속할 때 실행
   * @function
   * @param client 소켓에 접속한 클라이언트
   */
  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`handleConnection: client.id ${client.id}`);
  }

  /**
   * 클라이언트가 홈페이지를 나가면 실행
   * @function
   * @param client 소켓에 접속한 클라이언트
   */
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`handleDisconnect: client.id ${client.id}`);
  }

  /**
   * 클라이언트가 홈페이지에 접속할 때 실행
   * @function
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('handleOnline')
  async handleOnline(@ConnectedSocket() client: Socket, @MessageBody() id: number): Promise<Users> {
    this.logger.log(`handleOnline: client.id ${client.id}`);
    const user = await this.usersRepository.findOne({ id });
    if (!user) {
      this.handleDisconnect(client);
    }
    this.logger.log(`handleOnline: online`);
    user.save();
    return user;
  }
}
