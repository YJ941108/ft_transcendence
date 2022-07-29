import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserStatus } from 'src/enums/games.enum';
import { CreateDirectMessageDto } from '../direct-message/dto/create-direct-message.dto';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { BadRequestTransformationFilter } from './chat.filter';
import { ChatService } from './chat.service';
import { ChatUser } from './class/chat-user.class';
import { ChatUsers } from './class/chat-users.class';

/**
 * @decorator WebSocketGateway
 * @class OnGatewayInit
 * @class OnGatewayConnection
 * @class OnGatewayDisconnect
 */
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  namespace: 'api/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('chatGateway');
  private chatUsers: ChatUsers = new ChatUsers();

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  returnMessage(func: string, code: number, message: string, data?: Object[] | Object, dataLog?: boolean): Object {
    this.logger.log(`${func} [${code}]: ${message}`);
    if (data && dataLog) {
      this.logger.log(`data: ${JSON.stringify(data)}`);
    }
    return {
      func,
      code,
      message,
      data,
    };
  }

  /**
   * Socket.io
   */

  /**
   * 소켓이 만들어질 때 실행
   * @function
   * @param server 서버 소켓
   */
  afterInit(server: any) {
    this.logger.log(`afterInit: ${server.name} 초기화`);
  }

  /**
   * 클라이언트가 서버 소켓에 접속할 때 실행
   * @function
   * @param client 소켓에 접속한 클라이언트
   */
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`handleConnection: 접속한 유저 ${client.id}`);
  }

  /**
   * 클라이언트가 다른 페이지로 벗어나면 실행
   * @function
   * @param client 소켓에 접속한 클라이언트
   */
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {}

  /**
   * 유저 관리
   */

  /**
   *
   * @param client
   * @param newUser
   */
  @SubscribeMessage('joinChat')
  handleNewUser(@ConnectedSocket() client: Socket, @MessageBody() newUser: ChatUser) {
    let user = this.chatUsers.getUserById(newUser.id);
    if (user) {
      return this.returnMessage(
        'joinChat',
        400,
        '채팅 소켓에 이미 접속했습니다',
        {
          userId: user.id,
          status: UserStatus[user.status],
        },
        true,
      );
    }

    /**
     * 유저 추가
     * 유저 상태 변경
     * 유저 리스트에 추가
     * 유저 생성 알림
     */
    user = new ChatUser(newUser.id, newUser.nickname, client.id);
    user.setUserStatus(UserStatus.ONLINE);
    this.chatUsers.addUser(user);
    this.server.emit('listeningUser', {
      func: 'listeningUser',
      code: 200,
      message: '누군가 채팅 소켓에 접속했습니다',
      data: {
        userId: user.id,
        status: 'ONLINE',
      },
    });
    return this.returnMessage(
      'joinChat',
      200,
      '채팅 소켓에 접속했습니다',
      {
        userId: user.id,
        status: UserStatus[user.status],
      },
      true,
    );
  }

  /**
   *
   * @param client
   * @param param1
   */
  @SubscribeMessage('getUserStatus')
  async handleGetUserStatus(@ConnectedSocket() client: Socket, @MessageBody() { userId }: { userId: number }) {
    const user = this.chatUsers.getUserById(userId);

    let data = {};

    if (!user) {
      data = {
        userId,
        status: UserStatus[UserStatus.OFFLINE],
      };
    } else {
      data = {
        userId,
        status: UserStatus[user.status],
      };
    }

    return this.returnMessage('getUserStatus', 200, '상태 불러오기 성공', data, true);
  }

  userJoinRoom(socketId: string, roomId: string) {
    this.chatUsers.addRoomToUser(socketId, roomId);
    this.server.in(socketId).socketsJoin(roomId);
  }

  userLeaveRoom(socketId: string, roomId: string) {
    this.chatUsers.removeRoomFromUser(socketId, roomId);
    this.server.in(socketId).socketsLeave(roomId);
  }

  /** DM */

  /**
   * DM을 한 번도 하지 않은 유저와 사용
   * 방이 없다면 방을 만들고 상대방에게 알림
   * 방이 있다면 방 정보 불러오기
   * @param client
   * @param data
   * @returns
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('createDMRoom')
  async handleCreateDm(@ConnectedSocket() client: Socket, @MessageBody() data: CreateDirectMessageDto) {
    try {
      let dm = await this.chatService.checkIfDmExists(data.users[0].id.toString(), data.users[1].id.toString());
      console.log(dm);

      if (!dm) {
        dm = await this.chatService.createDm(data);

        const user = this.chatUsers.getUser(client.id);
        const friend = data.users.find((dmUser) => dmUser.id !== user.id);
        const friendUser = this.chatUsers.getUserById(friend.id);

        /**
         * 상대방에게 방 만든걸 알려줘야함 그래서 상대방이 getUserDMs를 해야 함
         */
        if (friendUser) {
          this.userJoinRoom(friendUser.socketId, `dm_${dm.id}`);
          this.server.to(friendUser.socketId).emit('listeningDMRoom');
        }
      }
      this.userJoinRoom(client.id, `dm_${dm.id}`);
      return this.returnMessage('createDMRoom', 200, '방 정보', dm);
    } catch (e) {
      console.log(e);
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   * DM 모든 리스트 불러오고 조인
   * @param client
   * @param param1
   * @returns
   */
  @SubscribeMessage('joinUserDMRooms')
  async handleUserDms(@ConnectedSocket() client: Socket, @MessageBody() { userId }: { userId: number }) {
    const DMRooms = await this.chatService.getUserDMRooms(userId);

    for (const DMRoom of DMRooms) {
      this.userJoinRoom(client.id, `dm_${DMRoom.id}`);
    }

    return this.returnMessage('joinUserDMRooms', 200, 'DM 리스트', DMRooms, false);
  }

  /**
   * DM 방에 접속하고
   * @param client
   * @param body
   * @returns
   */
  @SubscribeMessage('joinDMRoom')
  async handleDmData(@ConnectedSocket() client: Socket, @MessageBody() body: { DMId: number }) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (!body.DMId) {
      return this.returnMessage('joinDMRoom', 400, '키가 올바르지 않습니다');
    }

    const dm = await this.chatService.getDmData(body.DMId);
    const roomId = `dm_${dm.id}`;
    this.userJoinRoom(client.id, roomId);
    return this.returnMessage('joinDMRoom', 200, 'DM 방에 들어왔습니다.', dm, false);
  }

  /**
   * 메시지 보내기
   * @param client
   * @param data
   * @returns
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('sendDM')
  async handleDmSubmit(@ConnectedSocket() client: Socket, @MessageBody() data: CreateMessageDto) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    try {
      const message = await this.chatService.addMessageToDm(data);
      this.server.to(`dm_${message.DM.id}`).emit('listeningDM', {
        func: 'listeningUser',
        code: 200,
        message: '누군가 채팅 소켓에 접속했습니다',
        data: message,
      });
      return this.returnMessage('sendDM', 200, '메시지 보내기 성공', message, true);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }
}
