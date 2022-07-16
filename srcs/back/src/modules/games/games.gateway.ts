import { Logger } from '@nestjs/common';
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
import { ConnectedUsers } from './class/connected-user.class';
import Room from './class/game-room.class';
import Queue from './class/queue.class';
import { User } from './class/user.class';
import { GameState, UserStatus } from '../../enums/games.enum';
import { SET_INTERVAL_MILISECONDS } from 'src/constants/games.constant';

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
  namespace: 'api/games',
})
export class GamesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  /** Logger */
  private logger: Logger = new Logger('gameGateway');

  constructor() {}

  /** @type server */
  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUsers = new ConnectedUsers();
  private currentGames: Array<Room> = new Array();
  private queue: Queue = new Queue();
  private rooms: Map<string, Room> = new Map();

  createNewRoom(paddles: Array<User>): void {
    const roomId: string = `${paddles[0].nickname}&${paddles[1].nickname}`;
    const room: Room = new Room(roomId, paddles, { mode: paddles[0].mode });

    this.server.to(paddles[0].socketId).emit('newRoom', room);
    this.server.to(paddles[1].socketId).emit('newRoom', room);
    this.rooms.set(roomId, room);
    this.currentGames.push(room);

    this.server.emit('updateCurrentGames', this.currentGames);
  }

  /**
   * 소켓이 만들어질 때 실행
   * @function
   * @param server 서버 소켓
   */
  afterInit(server: any) {
    this.logger.log(`afterInit: ${server.name} 초기화`);
    setInterval(() => {
      if (this.queue.size() > 1) {
        const paddles: Array<User> = this.queue.matchPlayers();

        if (paddles.length === 0) {
          return;
        }
        this.createNewRoom(paddles);
      }
    }, SET_INTERVAL_MILISECONDS);
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
  handleDisconnect(@ConnectedSocket() client: Socket): Object {
    this.logger.log(`handleDisconnect: 소켓을 나간 유저 ${client.id}`);

    const user: User = this.connectedUsers.getUserBySocketId(client.id);

    if (user) {
      this.queue.removeUser(user);
      this.connectedUsers.removeUser(user);
      return { code: 200, message: `${user.nickname} is left` };
    }
    return { code: 400, message: 'Noting to change' };
  }

  /**
   * 유저가 접속하면 connectedUsers에 유저를 등록해야 함
   * @function handleUserConnect
   * @param client 소켓에 접속한 클라이언트
   * @param user 소켓이 보내는 데이터
   * @return connectedUsers
   */
  @SubscribeMessage('handleUserConnect')
  handleUserConnect(@ConnectedSocket() client: Socket, @MessageBody() user: User): ConnectedUsers {
    this.logger.log(`handleUserConnect: client.id: ${client.id}`);
    this.logger.log(`handleUserConnect: user.id: ${user.id}`);
    let newUser: User = this.connectedUsers.getUserById(user.id);
    if (newUser) {
      newUser.setSocketId(client.id);
      newUser.setNickname(user.nickname);
    } else {
      newUser = new User(user.id, user.nickname, client.id, user.ratio);
    }
    newUser.setUserStatus(UserStatus.IN_HUB);
    this.logger.log(`handleUserConnect: newUser: ${JSON.stringify(newUser)}`);
    this.connectedUsers.addUser(newUser);
    this.logger.log(`handleUserConnect: connectedUsers: ${JSON.stringify(this.connectedUsers)}`);
    return this.connectedUsers;
  }

  /**
   * 현재 열려있는 게임 확인
   * @function handleGetCurrentGames
   * @param client 소켓에 접속한 클라이언트
   * @return Array<Room>
   */
  @SubscribeMessage('getCurrentGames')
  handleGetCurrentGames(@ConnectedSocket() client: Socket): Array<Room> {
    this.logger.log(`handleGetCurrentGames: client.id: ${client.id}`);
    this.logger.log(
      `handleGetCurrentGames: user.nickname: ${this.connectedUsers.getUserBySocketId(client.id).nickname}`,
    );
    this.server.to(client.id).emit('updateCurrentGames', this.currentGames);
    return this.currentGames;
  }

  /**
   *
   * @function handleJoinQueue
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('joinQueue')
  handleJoinQueue(@ConnectedSocket() client: Socket): Object {
    this.logger.log(`handleJoinQueue: client.id: ${client.id}`);
    this.logger.log(`handleJoinQueue: user.nickname: ${this.connectedUsers.getUserBySocketId(client.id).nickname}`);

    const user: User = this.connectedUsers.getUserBySocketId(client.id);
    this.logger.log(`handleJoinQueue: user: ${JSON.stringify(user)}`);

    if (user && !this.queue.isInQueue(user)) {
      this.connectedUsers.changeUserStatus(client.id, UserStatus.IN_QUEUE);
      this.queue.enqueue(user);
      this.server.to(client.id).emit('joinedQueue');
      return { code: 200, message: 'joinQueue successed' };
    }
    return { code: 400, message: 'joinQueue failed' };
  }

  /**
   *
   * @function handleLeaveQueue
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() client: Socket) {
    this.logger.log(`handleLeaveQueue: client.id: ${client.id}`);

    const user: User = this.connectedUsers.getUserBySocketId(client.id);

    if (user && this.queue.isInQueue(user)) {
      this.queue.removeUser(user);
      this.server.to(client.id).emit('leavedQueue');
    }
  }

  /**
   * @function handleJoinRoom
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    this.logger.log(`handleJoinRoom: client.id: ${client.id}`);

    const room: Room = this.rooms.get(roomId);

    if (room) {
      const user = this.connectedUsers.getUserBySocketId(client.id);

      client.join(roomId);
      if (user.status === UserStatus.IN_HUB) {
        this.connectedUsers.changeUserStatus(client.id, UserStatus.SPECTATING);
      } else if (room.isAPlayer(user)) {
        room.addUser(user);
      }

      this.server.to(client.id).emit('joinedRoom');
      this.server.to(client.id).emit('updateRoom', JSON.stringify(room.serialize()));
    }
  }

  /**
   * @function handleLeaveRoom
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    this.logger.log(`handleLeaveRoom: client.id: ${client.id}`);

    const room: Room = this.rooms.get(roomId);
    const user: User = this.connectedUsers.getUserBySocketId(client.id);

    if (user && room) {
      room.removeUser(user);

      if (room.paddles.length === 0) {
        this.logger.log('No user left in the room deleting it...');
        this.rooms.delete(room.roomId);

        const roomIndex: number = this.currentGames.findIndex((toRemove) => toRemove.roomId === room.roomId);
        if (roomIndex !== -1) {
          this.currentGames.splice(roomIndex, 1);
        }
        this.server.emit('updateCurrentGames', this.currentGames);
      }
      if (
        room.isAPlayer(user) &&
        room.gameState !== GameState.PLAYER_ONE_WIN &&
        room.gameState !== GameState.PLAYER_TWO_WIN
      ) {
        room.pause();
      }

      client.leave(room.roomId);
      this.connectedUsers.changeUserStatus(client.id, UserStatus.IN_HUB);
    }
    this.server.to(client.id).emit('leavedRoom');
  }

  /**
   * 테스트 용도
   * @function
   * @param client 소켓에 접속한 클라이언트
   * @return Array<Room>
   */
  @SubscribeMessage('sendMessage')
  handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any[]): String {
    this.logger.log(`handleSendMessage: client.id: ${JSON.stringify(client.data)}`);
    this.logger.log(`handleSendMessage: message: ${payload[0]}`);
    this.logger.log(`handleSendMessage: message: ${payload[1]}`);
    return `Server received the message: ${payload[0]}`;
  }
}
