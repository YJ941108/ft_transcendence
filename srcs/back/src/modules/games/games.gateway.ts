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
  handleDisconnect(@ConnectedSocket() client: Socket): Object {
    this.logger.log(`handleDisconnect: 소켓을 나간 유저 ${client.id}`);

    const user: User = this.connectedUsers.getUserBySocketId(client.id);

    if (user) {
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
    this.logger.log(`handleUserConnect: user: ${JSON.stringify(user)}`);

    if (user) {
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

    return;
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
    this.logger.log(`handleGetCurrentGames: user: ${JSON.stringify(this.connectedUsers.getUserBySocketId(client.id))}`);
    this.logger.log(
      `handleGetCurrentGames: user.nickname: ${this.connectedUsers.getUserBySocketId(client.id).nickname}`,
    );
    this.logger.log(`handleGetCurrentGames: currentGames: ${JSON.stringify(this.currentGames)}`);
    console.log(this.currentGames);
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
    this.logger.log(`handleJoinQueue: user: ${JSON.stringify(this.connectedUsers.getUserBySocketId(client.id))}`);
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
    const user = this.connectedUsers.getUserBySocketId(client.id);

    if (room) {
      client.join(roomId);
      if (user.status === UserStatus.IN_HUB) {
        this.connectedUsers.changeUserStatus(client.id, UserStatus.SPECTATING);
      } else if (room.isAPlayer(user)) {
        room.addUser(user);
      }

      console.log(room.serialize());
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
    this.logger.log(`handleGetCurrentGames: currentGames: before: ${this.currentGames}`);

    const room: Room = this.rooms.get(roomId);
    const user: User = this.connectedUsers.getUserBySocketId(client.id);

    if (user && room) {
      room.removeUser(user);

      if (room.players.length === 0) {
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
    this.logger.log(`handleGetCurrentGames: currentGames: after: ${this.currentGames}`);
  }

  /**
   *
   * @param room
   * @param currentTimestamp
   */
  async saveGame(room: Room, currentTimestamp: number) {
    let winner_id: number, loser_id: number, winner_score: number, loser_score: number;

    if (room.gameState === GameState.PLAYER_ONE_WIN) {
      winner_id = room.paddleOne.user.id;
      loser_id = room.paddleTwo.user.id;
      winner_score = room.paddleOne.goal;
      loser_score = room.paddleTwo.goal;
    } else if (room.gameState === GameState.PLAYER_TWO_WIN) {
      winner_id = room.paddleTwo.user.id;
      loser_id = room.paddleOne.user.id;
      winner_score = room.paddleTwo.goal;
      loser_score = room.paddleOne.goal;
    }

    const winner = await this.usersService.getUser(winner_id);
    const loser = await this.usersService.getUser(loser_id);

    await this.usersService.updateStats(winner, true);
    await this.usersService.updateStats(loser, false);

    /* Save game in database */
    await this.gamesService.create({
      players: [winner, loser],
      winner_id: winner_id,
      loser_id: loser_id,
      created_at: new Date(room.timestampStart),
      ended_at: new Date(currentTimestamp),
      game_duration: room.getDuration(),
      winner_score: winner_score,
      loser_score: loser_score,
      mode: room.mode,
    });

    const roomIndex: number = this.currentGames.findIndex((toRemove) => toRemove.roomId === room.roomId);

    if (roomIndex !== -1) {
      this.currentGames.splice(roomIndex, 1);
    }
    this.server.emit('updateCurrentGames', this.currentGames);
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

    if (room) {
      const currentTimestamp: number = Date.now();

      if (room.gameState === GameState.WAITING) {
        if (room.players.length === 2) {
          room.gameState = GameState.STARTING;
          room.start();
        }
      }
      if (
        room.gameState === GameState.STARTING &&
        currentTimestamp - room.timestampStart >= this.secondToTimestamp(3.5)
      ) {
        room.start();
      } else if (room.gameState === GameState.PLAYING) {
        room.update(currentTimestamp);
        if (room.isGameEnd) {
          this.saveGame(room, currentTimestamp);
        }
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
}
