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
import { GameMode, GameState, UserStatus } from '../../enums/games.enum';
import { SET_INTERVAL_MILISECONDS } from 'src/constants/games.constant';
import { GamesService } from './games.service';
import { UsersService } from '../users/users.service';

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

  constructor(private readonly gamesService: GamesService, private readonly usersService: UsersService) {}

  /** @type server */
  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUsers = new ConnectedUsers();
  private currentGames: Array<Room> = new Array();
  private queue: Queue = new Queue();
  private rooms: Map<string, Room> = new Map();

  returnMessage(func: string, code: number, message: string, data?: Object[] | Object): Object {
    this.logger.log(`${func} [${code}]: ${message}`);
    if (data) {
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
   * 큐가 찼다면 게임 생성
   * @param players
   */
  createNewRoom(players: Array<User>): void {
    const roomId: string = `${players[0].nickname}&${players[1].nickname}`;
    const room: Room = new Room(roomId, players, { mode: players[0].mode });

    this.server.to(players[0].socketId).emit('newRoom', room);
    this.server.to(players[1].socketId).emit('newRoom', room);
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
        const players: Array<User> = this.queue.matchPlayers();

        if (players.length === 0) {
          return;
        }
        this.createNewRoom(players);
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
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const user: User = this.connectedUsers.getUserBySocketId(client.id);
    if (!user) {
      this.returnMessage('handleUserConnect', 400, '유저 데이터가 없습니다.');
      return;
    }

    /** 게임 중인 경우 게임 방 전체를 조회해야 한다 */
    this.rooms.forEach((room: Room) => {
      /** 게임 방에 있다면 우선 유저부터 방에서 지워야 한다 */
      if (room.isAPlayer(user)) {
        room.removeUser(user);

        /**
         * 게임 방에 아무도 없는 경우 -> rooms 인스턴스에서 게임을 지우고, currentGames에서도 지운다.
         * 누군가 있는 경우 -> pause
         */
        if (room.players.length === 0 && room.gameState !== GameState.WAITING) {
          this.logger.log('No player left in the room deleting it...');
          this.rooms.delete(room.roomId);

          const roomIndex: number = this.currentGames.findIndex((toRemove) => toRemove.roomId === room.roomId);
          if (roomIndex !== -1) {
            this.currentGames.splice(roomIndex, 1);
          }
          this.server.emit('updateCurrentGames', this.currentGames);
        } else if (
          room.gameState !== GameState.PLAYER_ONE_WIN &&
          room.gameState !== GameState.PLAYER_TWO_WIN &&
          room.gameState !== GameState.WAITING
        ) {
          if (room.gameState === GameState.PLAYER_ONE_SCORED || room.gameState === GameState.PLAYER_TWO_SCORED) {
            room.resetPosition();
          }
          room.pause();
        }
        client.leave(room.roomId);
        return;
      }
    });

    this.queue.removeUser(user);
    this.connectedUsers.removeUser(user);
  }

  /**
   * 유저가 접속하면 connectedUsers에 유저를 등록해야 함
   * @function handleUserConnect
   * @param client 소켓에 접속한 클라이언트
   * @param user 소켓이 보내는 데이터
   * @return connectedUsers
   */
  @SubscribeMessage('handleUserConnect')
  handleUserConnect(@ConnectedSocket() client: Socket, @MessageBody() user: User): User[] | Object {
    if (!user.id) {
      return this.returnMessage('handleUserConnect', 400, '유저 데이터가 없습니다.');
    }

    /** 유저 생성 */
    let newUser: User = this.connectedUsers.getUserById(user.id);
    if (!newUser) {
      newUser = new User(user.id, user.nickname, client.id, user.ratio);
    } else {
      newUser.setSocketId(client.id);
      newUser.setNickname(user.nickname);
    }
    newUser.setUserStatus(UserStatus.IN_HUB);

    /** 접속중인 유저에 추가 */
    const isConnected = this.connectedUsers.getUserById(newUser.id);
    if (!isConnected) {
      this.connectedUsers.addUser(newUser);
    }

    /** 접속중인 유저 반환 */
    const users = this.connectedUsers.findAll();
    return this.returnMessage('handleUserConnect', 200, '성공', users);
  }

  /**
   * 현재 열려있는 게임 확인
   * @function handleGetCurrentGames
   * @param client 소켓에 접속한 클라이언트
   * @return Array<Room>
   */
  @SubscribeMessage('getCurrentGames')
  handleGetCurrentGames(@ConnectedSocket() client: Socket): Array<Room> {
    this.server.to(client.id).emit('updateCurrentGames', this.currentGames);
    return this.currentGames;
  }

  /**
   *
   * @function handleJoinQueue
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('joinQueue')
  handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() mode: string): Object {
    const user: User = this.connectedUsers.getUserBySocketId(client.id);
    if (!user.id) {
      return this.returnMessage('handleUserConnect', 400, '유저 데이터가 없습니다.');
    }

    if (mode !== 'DEFAULT') {
      return this.returnMessage('joinQueue', 400, '모드가 올바르지 않습니다.');
    } else if (user && this.queue.isInQueue(user)) {
      return this.returnMessage('joinQueue', 400, '이미 큐에 들어왔습니다');
    } else if (user && !this.queue.isInQueue(user)) {
      this.connectedUsers.changeUserStatus(client.id, UserStatus.IN_QUEUE);
      this.connectedUsers.setGameMode(client.id, mode);
      this.queue.enqueue(user);
      this.server.to(client.id).emit('joinedQueue');
      return this.returnMessage('joinQueue', 200, '큐에 정상적으로 들어왔습니다');
    }
  }

  /**
   *
   * @function handleLeaveQueue
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() client: Socket) {
    const user: User = this.connectedUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('leaveQueue', 400, '유저가 없습니다.');
    } else if (!this.queue.isInQueue(user)) {
      return this.returnMessage('leaveQueue', 400, '큐에 유저가 없습니다.', user);
    } else {
      this.queue.removeUser(user);
      this.server.to(client.id).emit('leavedQueue');
      return this.returnMessage('leaveQueue', 200, '큐에서 나왔습니다.');
    }
  }

  /**
   * @function handleJoinRoom
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const user = this.connectedUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinRoom', 400, '유저가 없습니다.');
    }

    const room: Room = this.rooms.get(roomId);
    if (!room) {
      return this.returnMessage('joinRoom', 400, 'room이 없습니다.', roomId);
    } else if (room.findOne(user) !== -1) {
      return this.returnMessage('joinRoom', 400, '이미 방에 들어왔습니다.');
    }
    /** 방 접속 */
    client.join(roomId);

    /**
     * 관전자인 경우
     * 플레이어인 경우
     */
    if (user.status === UserStatus.IN_HUB) {
      this.connectedUsers.changeUserStatus(client.id, UserStatus.SPECTATING);
    } else if (room.isAPlayer(user)) {
      room.addUser(user);
    }
    this.server.to(client.id).emit('joinedRoom');
    this.server.to(client.id).emit('updateRoom', JSON.stringify(room.serialize()));
    return this.returnMessage('joinRoom', 200, '방에 들어왔습니다.');
  }

  /**
   * @function handleLeaveRoom
   * @param client 소켓에 접속한 클라이언트
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const user: User = this.connectedUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('leaveRoom', 400, '유저가 없습니다.');
    }

    const room: Room = this.rooms.get(roomId);
    if (!room) {
      return this.returnMessage('leaveRoom', 400, 'room이 없습니다.', roomId);
    } else if (!room.isAPlayer(user)) {
      return this.returnMessage('leaveRoom', 400, '이미 방을 나갔습니다.');
    }
    room.removeUser(user);

    /** 방에 아무도 없다면 */
    if (room.players.length === 0) {
      this.logger.log('No user left in the room deleting it...');
      this.rooms.delete(room.roomId);

      const roomIndex: number = this.currentGames.findIndex((toRemove) => toRemove.roomId === room.roomId);
      if (roomIndex !== -1) {
        this.currentGames.splice(roomIndex, 1);
      }
      this.server.emit('updateCurrentGames', this.currentGames);
    }

    /** 게임이 진행중이었다면 일시정지 */
    if (
      room.isAPlayer(user) &&
      room.gameState !== GameState.PLAYER_ONE_WIN &&
      room.gameState !== GameState.PLAYER_TWO_WIN
    ) {
      room.pause();
    }

    client.leave(room.roomId);
    this.connectedUsers.changeUserStatus(client.id, UserStatus.IN_HUB);
    this.server.to(client.id).emit('leavedRoom');
    this.logger.log(`handleGetCurrentGames: currentGames: after: ${this.currentGames}`);
  }

  /**
   *
   * @param room
   * @param currentTimestamp
   */
  async saveGame(room: Room, currentTimestamp: number) {
    let winnerId: number, loserId: number, winnerScore: number, loserScore: number;

    if (room.gameState === GameState.PLAYER_ONE_WIN) {
      winnerId = room.paddleOne.user.id;
      loserId = room.paddleTwo.user.id;
      winnerScore = room.paddleOne.goal;
      loserScore = room.paddleTwo.goal;
    } else if (room.gameState === GameState.PLAYER_TWO_WIN) {
      winnerId = room.paddleTwo.user.id;
      loserId = room.paddleOne.user.id;
      winnerScore = room.paddleTwo.goal;
      loserScore = room.paddleOne.goal;
    }

    const winner = await this.usersService.getUser(winnerId);
    const loser = await this.usersService.getUser(loserId);

    await this.usersService.updateStats(winner, true);
    await this.usersService.updateStats(loser, false);

    /**
     *
     */
    const game = await this.gamesService.create({
      players: [winner, loser],
      winnerId: winnerId,
      loserId: loserId,
      createdAt: new Date(room.timestampStart),
      endedAt: new Date(currentTimestamp),
      gameDuration: room.getDuration(),
      winnerScore: winnerScore,
      loserScore: loserScore,
      mode: room.mode,
    });

    const roomIndex: number = this.currentGames.findIndex((toRemove) => toRemove.roomId === room.roomId);

    if (roomIndex !== -1) {
      this.currentGames.splice(roomIndex, 1);
    }
    this.server.emit('updateCurrentGames', this.currentGames);
    return this.returnMessage('saveGame', 200, '저장 성공');
  }

  /**
   * milliseconds -> seconds
   * @param milliseconds
   * @returns
   */
  secondToTimestamp(milliseconds: number): number {
    return milliseconds * 1000;
  }

  /**
   * 게임이 시작되면 Room인스턴스 정보를 계속 요청
   * 1. Room이
   * @param roomId
   */
  @SubscribeMessage('requestUpdate')
  async handleRequestUpdate(@MessageBody() roomId: string) {
    const room: Room = this.rooms.get(roomId);
    if (!room) {
      return this.returnMessage('requestUpdate', 400, 'room이 없습니다.', roomId);
    }

    const currentTimestamp: number = Date.now();

    /** 친구 초대로 대기중이라면 */
    if (room.gameState === GameState.WAITING) {
      if (room.players.length === 2) {
        room.gameState = GameState.STARTING;
        room.start();
      }
    }

    /**
     * 1. 게임 시작
     * 2. 게임 중
     * 3. 점수 났을 때
     * 4. 재시작 되었을때
     * 5. 일시정지라면
     */
    if (
      room.gameState === GameState.STARTING &&
      currentTimestamp - room.timestampStart >= this.secondToTimestamp(3.5)
    ) {
      room.start();
    } else if (room.gameState === GameState.PLAYING) {
      room.update(currentTimestamp);
    } else if (room.gameState === GameState.PLAYER_ONE_WIN || room.gameState === GameState.PLAYER_TWO_WIN) {
      this.saveGame(room, currentTimestamp);
    } else if (
      (room.gameState === GameState.PLAYER_ONE_SCORED || room.gameState === GameState.PLAYER_TWO_SCORED) &&
      currentTimestamp - room.goalTimestamp >= this.secondToTimestamp(1)
    ) {
      room.resetPosition();
      room.changeGameState(GameState.PLAYING);
      room.lastUpdate = Date.now();
    } else if (
      room.gameState === GameState.RESUMED &&
      currentTimestamp - room.pauseTime[room.pauseTime.length - 1].resume >= this.secondToTimestamp(3.5)
    ) {
      room.lastUpdate = Date.now();
      room.changeGameState(GameState.PLAYING);
    } else if (
      room.gameState === GameState.PAUSED &&
      currentTimestamp - room.pauseTime[room.pauseTime.length - 1].pause >= this.secondToTimestamp(42)
    ) {
      room.pauseForfait();
      room.pauseTime[room.pauseTime.length - 1].resume = Date.now();
      this.saveGame(room, currentTimestamp);
    }

    // if (
    //   room.mode === GameMode.TIMER &&
    //   (room.gameState === GameState.PLAYER_ONE_SCORED ||
    //     room.gameState === GameState.PLAYER_TWO_SCORED ||
    //     room.gameState === GameState.PLAYING)
    // )
    //   room.updateTimer();

    this.server.to(room.roomId).emit('updateRoom', JSON.stringify(room.serialize()));
  }

  /**
   * 클라이언트에서 Key를 누를 때 동작
   * ArrowUp / ArrowDown 키를 누르면 paddle 인스턴스의 up 변수가 true로 변경
   * @param client
   * @param data
   */
  @SubscribeMessage('keyDown')
  async handleKeyUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; key: string; nickname: string },
  ) {
    const room: Room = this.rooms.get(data.roomId);

    if (room && room.paddleOne.user.nickname === data.nickname) {
      if (data.key === 'ArrowUp') {
        room.paddleOne.up = true;
      }
      if (data.key === 'ArrowDown') {
        room.paddleOne.down = true;
      }
    } else if (room && room.paddleTwo.user.nickname === data.nickname) {
      if (data.key === 'ArrowUp') {
        room.paddleTwo.up = true;
      }
      if (data.key === 'ArrowDown') {
        room.paddleTwo.down = true;
      }
    }
  }

  /**
   * 클라이언트가 키를 뗄 때 동작
   * ArrowUp / ArrowDown 키를 떼면 paddle 인스턴스의 up 변수가 false로 변경
   * @param client
   * @param data
   */
  @SubscribeMessage('keyUp')
  async handleKeyDown(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; key: string; nickname: string },
  ) {
    const room: Room = this.rooms.get(data.roomId);

    if (room && room.paddleOne.user.nickname === data.nickname) {
      if (data.key === 'ArrowUp') {
        room.paddleOne.up = false;
      }
      if (data.key === 'ArrowDown') {
        room.paddleOne.down = false;
      }
    } else if (room && room.paddleTwo.user.nickname === data.nickname) {
      if (data.key === 'ArrowUp') {
        room.paddleTwo.up = false;
      }
      if (data.key === 'ArrowDown') {
        room.paddleTwo.down = false;
      }
    }
  }

  @SubscribeMessage('spectateRoom')
  handleSpectateRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const room: Room = this.rooms.get(roomId);
    if (!room) {
      return this.returnMessage('spectateRoom', 400, '방이 없습니다.');
    }

    const user = this.connectedUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('spectateRoom', 400, '유저가 접속해있지 않습니다.');
    }

    if (!room.isAPlayer(user)) {
      this.server.to(client.id).emit('newRoom', room);
      return this.returnMessage('spectateRoom', 200, '방 정보 전송 성공');
    }
  }
}
