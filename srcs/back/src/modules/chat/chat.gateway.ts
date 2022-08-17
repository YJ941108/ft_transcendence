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
import { CreateChannelDto } from '../channel/dto/create-channel.dto';
import { Channel } from '../channel/entities/channel.entity';
import { CreateDirectMessageDto } from '../direct-message/dto/create-direct-message.dto';
import { DirectMessage } from '../direct-message/entities/direct-message.entity';
import { User } from '../games/class/user.class';
import { GamesGateway } from '../games/games.gateway';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { Message } from '../message/entities/message.entity';
import { Users } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
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

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly pongGateway: GamesGateway,
  ) {}

  /**
   * 소켓 반환 함수
   *
   * @param func 함수 이름
   * @param code 함수 상태 코드
   * @param message 반환 메시지
   * @param data 반환 데이터
   * @param dataLog 반환 데이터 로그
   * @returns 반환 객체
   */
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

  async listeningGetUsers(socketId: string, functionName: string, dbUser?: Users): Promise<void> {
    const memoryUser = this.chatUsers.getUserBySocketId(socketId);
    let nickname;
    if (memoryUser) {
      nickname = memoryUser.nickname;
    }
    const dbUsers = await this.usersService.getUsersWithFriendsRequest();

    if (!dbUser) {
      dbUser = await this.usersService.getUserWithFriends(memoryUser.id);
    }

    for (let j = 0; j < dbUsers.length; j++) {
      /** 친구인지 아닌지 변환 */
      for (let i = 0; i < dbUser.friends.length; i++) {
        if (dbUser.friends[i].id === dbUsers[j].id) {
          dbUsers[j].isFriend = true;
        } else {
          dbUsers[j].isFriend = false;
        }
      }

      // dbUsers[j].friendsRequest.forEach((value, index, array) => {
      //   if (value.id === memoryUser.id) {
      //     dbUsers[j].isRequest = true;
      //   }
      // });

      /** 온라인인지 오프라인인지 변환 */
      if (this.chatUsers.getUserByNickname(dbUsers[j].nickname)) {
        dbUsers[j].isOnline = true;
      }
    }

    this.server.emit('listeningGetUsers', {
      func: 'listeningGetUsers',
      code: 200,
      message: `[${socketId}][${nickname}]: ${functionName}->listeningGetUsers`,
      data: dbUsers,
    });
  }

  async listeningMe(socketId: string, functionName: string): Promise<void> {
    const memoryUser = this.chatUsers.getUserBySocketId(socketId);
    const dbUsers = await this.usersService.getUsers();
    const dbUser = await this.usersService.getUserWithFriends(memoryUser.id);

    for (let j = 0; j < dbUser.friendsRequest.length; j++) {
      /** 온라인인지 오프라인인지 변환 */
      if (this.chatUsers.getUserByNickname(dbUser.friendsRequest[j].nickname)) {
        dbUser.friendsRequest[j].isOnline = true;
      }
    }

    for (let j = 0; j < dbUser.friends.length; j++) {
      /** 온라인인지 오프라인인지 변환 */
      if (this.chatUsers.getUserByNickname(dbUser.friends[j].nickname)) {
        dbUser.friends[j].isOnline = true;
      }
    }

    this.server.to(socketId).emit('listeningMe', {
      func: 'listeningMe',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningMe`,
      data: dbUser,
    });
  }

  afterInit(server: any) {
    this.logger.log(`afterInit: ${server.name} 초기화`);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`handleConnection: ${client.id}`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    let memoryUser = this.chatUsers.getUser(client.id);
    if (!memoryUser) {
      return;
    }

    const dbUser = await this.usersService.getUserWithFriends(memoryUser.id);
    this.chatUsers.removeUser(memoryUser);
    await this.listeningGetUsers(client.id, 'handleDiscoonection', dbUser);
  }

  /**
   * 채팅 소켓 접속시 실행되어 유저 정보를 메모리에 저장
   */
  @SubscribeMessage('joinChat')
  async handleNewUser(@ConnectedSocket() client: Socket, @MessageBody() newUser: ChatUser) {
    /** 유저가 메모리에 있는지 확인 */
    let memoryUser = this.chatUsers.getUserById(newUser.id);
    if (!memoryUser) {
      /** 유저 메모리에 추가 */
      memoryUser = new ChatUser(newUser.id, newUser.nickname, client.id);
      this.chatUsers.addUser(memoryUser);
    } else {
      memoryUser.setSocketId(client.id);
      // const nickname = memoryUser.nickname;
      // return this.returnMessage('joinChat', 400, `${client.id}: ${nickname}:가 채팅 소켓에 이미 접속했습니다`);
    }

    try {
      await this.listeningGetUsers(client.id, 'joinChat');
      await this.listeningMe(client.id, 'joinChat');
      await this.listeningDMRoomList(client.id, memoryUser.id, memoryUser.nickname, 'joinChat');
      await this.listeningChannelList(client.id, memoryUser.id);

      /** 결과 반환 */
      return this.returnMessage(
        'joinChat',
        200,
        `${client.id}: ${memoryUser.nickname}이 joinChat 성공. 서버에서 listeningGetUsers && listeningMe를 emit함`,
      );
    } catch (e) {
      this.chatUsers.removeUser(memoryUser);
      this.server.to(client.id).emit('chatError', {
        func: 'joinChat',
        code: 400,
        message: `${client.id}: 오류가 발생해서 joinChat 실행에 실패했습니다.`,
        data: e,
      });
      this.logger.log('chatError', {
        func: 'joinChat',
        code: 400,
        message: `${client.id}: 오류가 발생해서 joinChat 실행에 실패했습니다.`,
        data: e,
      });
    }
  }

  /** 친구 */
  @SubscribeMessage('userAction')
  async handleUserAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { who: string; action: string },
  ): Promise<Object> {
    /** 메모리에 존재하는 유저인지 확인 */
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('userAction', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /** 어떤 액션을 할 것이냐 */
      await this.usersService.userAction({ id: memoryUser.id, nickname: data.who, action: data.action });

      /** 액션을 한 사람에게 전달 */
      await this.listeningMe(client.id, 'userAction');

      /** who에게 전달 */
      const memoryAnother = this.chatUsers.getUserByNickname(data.who);
      if (memoryAnother) {
        await this.listeningMe(memoryAnother.socketId, 'userAction');
      }

      return this.returnMessage('userAction', 200, `${data.action} 성공`);
    } catch (e) {
      this.server.to(client.id).emit('chatError', {
        func: 'userAction',
        code: 400,
        message: `${client.id}: 오류가 발생해서 userAction 실행에 실패했습니다.`,
        data: e,
      });
      return this.returnMessage('userAction', 400, `${data.action} 실패`);
    }
  }

  @SubscribeMessage('requestMyData')
  async handleGetUsers(@ConnectedSocket() client: Socket) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('createDMRoom', 400, '채팅 소켓에 유저가 없습니다');
    }

    await this.listeningMe(client.id, 'requestMyData');
  }

  @SubscribeMessage('requestMyDMList')
  async handleRequestMyDMList(@ConnectedSocket() client: Socket) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('createDMRoom', 400, '채팅 소켓에 유저가 없습니다');
    }

    await this.listeningDMRoomList(client.id, memoryUser.id, memoryUser.nickname, 'requestMyDMList');
  }

  /** DM */

  userJoinRoom(socketId: string, roomId: string) {
    this.chatUsers.addRoomToUser(socketId, roomId);
    this.server.in(socketId).socketsJoin(roomId);
  }

  userLeaveRoom(socketId: string, roomId: string) {
    this.chatUsers.removeRoomFromUser(socketId, roomId);
    this.server.in(socketId).socketsLeave(roomId);
  }

  async listeningDMRoomInfo(
    socketId: string,
    functionName: string,
    memoryUser?: ChatUser,
    dm?: DirectMessage,
  ): Promise<void> {
    const user = await this.usersService.getUserWithoutFriends(memoryUser.id);
    let another: Users;
    if (user.nickname === dm.users[0].nickname) {
      another = dm.users[1];
    } else {
      another = dm.users[0];
    }

    const response = {
      id: dm.id,
      me: user,
      another: another,
      createdAt: dm.createdAt,
      message: dm.messages,
    };

    this.server.to(socketId).emit('listeningDMRoomInfo', {
      func: 'listeningDMRoomInfo',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningGetUsers`,
      data: response,
    });
    this.logger.log({
      func: 'listeningDMRoomInfo',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningGetUsers`,
    });
  }

  async listeningDMRoomList(socketId: string, dbId: number, dbNickname: string, functionName: string): Promise<void> {
    /** 유저의 DM List */
    const DMRooms = await this.chatService.getUserDMRooms(dbId);
    for (const DMRoom of DMRooms) {
      this.userJoinRoom(socketId, `dm_${DMRoom.id}`);
    }

    const dbUser = await this.usersService.getUserWithoutFriends(dbId);

    let response: Array<{
      id: number;
      me: Users;
      another: Users;
      createdAt: Date;
      message: Message[];
    }> = [];
    for (let i = 0; i < DMRooms.length; i++) {
      let another: Users;
      if (dbUser.nickname === DMRooms[i].users[0].nickname) {
        another = DMRooms[i].users[1];
      } else {
        another = DMRooms[i].users[0];
      }

      DMRooms[i].messages.sort((a, b) => a.id - b.id);

      response.push({
        id: DMRooms[i].id,
        me: dbUser,
        another: another,
        createdAt: DMRooms[i].createdAt,
        message: DMRooms[i].messages,
      });
    }

    /** 블락 유저 제거 용 */
    const dbUserWithBlockedUsers = await this.usersService.getUserWithFriends(dbId);
    for (let i = 0; i < dbUserWithBlockedUsers.blockedUsers.length; i++) {
      const roomIndex: number = response.findIndex(
        (DMRoom) => DMRoom.another.id === dbUserWithBlockedUsers.blockedUsers[i].id,
      );
      if (roomIndex !== -1) {
        response.splice(roomIndex, 1);
      }
    }

    this.server.to(socketId).emit('listeningDMRoomList', {
      func: 'listeningDMRoomList',
      code: 200,
      message: `[${socketId}][${dbNickname}]: ${functionName}->listeningGetUsers`,
      data: response,
    });
    this.logger.log('listeningDMRoomList');
  }

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
  async handleCreateDm(@ConnectedSocket() client: Socket, @MessageBody() data: { anotherId: number }) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('createDMRoom', 400, '채팅 소켓에 유저가 없습니다');
    }
    const dbUser = await this.usersService.getUserWithoutFriends(memoryUser.id);

    /** 상대방 확인 */
    const dbAnother = await this.usersService.getUserWithoutFriends(data.anotherId);
    if (!dbAnother) {
      return this.returnMessage('createDMRoom', 400, '상대방 계정이 틀렸습니다');
    }

    try {
      /** 데이터 생성 */
      const dbUserAnother: CreateDirectMessageDto = {
        users: [dbUser, dbAnother],
      };

      /** DM 존재 확인 */
      let dm = await this.chatService.checkIfDmExists(dbUserAnother.users[0].id, dbUserAnother.users[1].id);

      /** 없으면 만들기 */
      if (!dm) {
        dm = await this.chatService.createDm(dbUserAnother);
        const friend = dbUserAnother.users.find((dmUser) => dmUser.id !== memoryUser.id);
        const friendUser = this.chatUsers.getUserById(friend.id);

        /** 상대방에게 방 만든걸 알려줘야함 */
        if (friendUser) {
          this.userJoinRoom(friendUser.socketId, `dm_${dm.id}`);
          this.listeningDMRoomList(friendUser.socketId, friendUser.id, friendUser.nickname, 'createDMRoom');
        }
      }

      const orderedDM = await this.chatService.getDmData(dm.id);

      /** 나는 DM방에 들어가야 함 */
      this.userJoinRoom(client.id, `dm_${dm.id}`);
      this.listeningDMRoomInfo(client.id, 'createDMRoom', memoryUser, orderedDM);

      // /** 상대방에게 리스트 갱신하기 */
      // const memoryUsers = this.chatUsers.getUsers();
      // for (let i = 0; i < memoryUsers.length; i++) {
      //   this.listeningDMRoomList(
      //     memoryUsers[i].socketId,
      //     memoryUsers[i].id,
      //     memoryUsers[i].nickname,
      //     'listeningDMRoomList',
      //   );
      // }
      return this.returnMessage('createDMRoom', 200, 'listeningDMRoomInfo, listeningDMRoomList', dm.id);
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
  @SubscribeMessage('joinDMRooms')
  async handleUserDms(@ConnectedSocket() client: Socket, @MessageBody() { userId }: { userId: number }) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    this.listeningDMRoomList(client.id, memoryUser.id, memoryUser.nickname, 'joinDMRooms');
    return this.returnMessage('joinDMRooms', 200, 'DM 리스트');
  }

  /**
   * DM 방에 접속하고
   * @param client
   * @param body
   * @returns
   */
  @SubscribeMessage('joinDMRoom')
  async handleDmData(@ConnectedSocket() client: Socket, @MessageBody() body: { DMId: number }) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (!body.DMId) {
      return this.returnMessage('joinDMRoom', 400, '키가 올바르지 않습니다');
    }

    const dm = await this.chatService.getDmData(body.DMId);
    const roomId = `dm_${dm.id}`;
    this.userJoinRoom(client.id, roomId);
    this.listeningDMRoomInfo(client.id, 'joinDMRoom', memoryUser, dm);
    return this.returnMessage('joinDMRoom', 200, 'DM 방에 들어왔습니다.');
  }

  /**
   * 메시지 보내기
   * @param client
   * @param data
   * @returns
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('sendDMMessage')
  async handleDmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { DMId: number; authorId: number; message: string; type?: string; roomId?: string },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    const DM = await this.chatService.getDmData(data.DMId);
    const author = await this.usersService.getUserWithoutFriends(data.authorId);

    const message: CreateMessageDto = { DM, author, content: data.message };

    if (data.type === 'invite') {
      message.type = data.type;
    }
    if (data.roomId) {
      message.roomId = data.roomId;
    }

    try {
      const sendMessage = await this.chatService.addMessageToDm(message);
      const emitData: { id: number; content: string; createdAt: Date; author: Users; type: string; roomId: string } = {
        id: sendMessage.id,
        content: sendMessage.content,
        createdAt: sendMessage.createdAt,
        author: author,
        type: sendMessage.type,
        roomId: sendMessage.roomId,
      };
      // const refactorMessage = {
      //   content: sendMessage.content,
      //   DMId: sendMessage.DM.id,
      //   author: {

      //   }
      // }
      this.server.to(`dm_${message.DM.id}`).emit('listeningDMMessage', {
        func: 'sendDMMessage',
        code: 200,
        message: `${message.DM.id}에서 메시지가 도착했습니다`,
        data: emitData,
      });
      // const NewDM = await this.chatService.getDmData(data.DMId);
      // this.listeningDMRoomInfo(`dm_${message.DM.id}`, 'sendDMMessage', memoryUser, NewDM);
      this.listeningDMRoomList(emitData.roomId, memoryUser.id, memoryUser.nickname, 'sendDMMessage');

      return this.returnMessage('sendDMMessage', 200, '메시지 보내기 성공');
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   * Channels
   */
  async listeningChannelList(clientId?: string, dbUserId?: number) {
    const channels = await this.chatService.getUserChannels(dbUserId);
    for (let i = 0; i < channels.length; i++) {
      const roomId = `channel_${channels[i].id}`;
      this.userJoinRoom(clientId, roomId);
    }

    if (!clientId) {
      this.server.emit('listeningChannelList', {
        func: 'listeningChannelList',
        code: 200,
        message: `채팅 방 리스트를 보냈습니다.`,
        data: channels,
      });
    } else {
      this.server.to(clientId).emit('listeningChannelList', {
        func: 'listeningChannelList',
        code: 200,
        message: `채팅 방 리스트를 보냈습니다.`,
        data: channels,
      });
    }
  }

  async listeningChannelInfo(channel: Channel, roomId?: string) {
    if (!roomId) {
      this.server.emit('listeningChannelInfo', {
        func: 'listeningChannelInfo',
        code: 200,
        message: `채팅 방 정보를 보냈습니다.`,
        data: channel,
      });
    } else {
      this.server.to(roomId).emit('listeningChannelInfo', {
        func: 'listeningChannelInfo',
        code: 200,
        message: `채팅 방 정보를 보냈습니다.`,
        data: channel,
      });
    }
  }

  async listeningMessage(channelId: string, data: Object) {
    this.server.to(channelId).emit('listeningBan', {
      func: 'isBanFromChannel',
      code: 200,
      message: `채널 입장 가능 여부`,
      data,
    });
  }

  async chatError(client: Socket, error: any) {
    this.logger.log(client.id, error);
    this.server.to(client.id).emit('chatError', error.message);
  }

  /**
   * 채널 데이터 획득
   * getChannels
   * getChannel
   * getChannelWithUser
   */
  @SubscribeMessage('getChannelList')
  async handleUserChannels(@ConnectedSocket() client: Socket) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannelList', 400, '채팅 소켓에 유저가 없습니다');
    }

    const channels = await this.chatService.getUserChannels(memoryUser.id);
    for (const channel of channels) {
      this.userJoinRoom(client.id, `channel_${channel.id}`);
    }

    this.server.to(client.id).emit('listeningChannelList', {
      func: 'listeningChannelList',
      code: 200,
      message: `채팅 방 리스트를 보냈습니다.`,
      data: channels,
    });

    return this.returnMessage('getChannels', 200, 'listeningChannelList 확인');
  }

  @SubscribeMessage('getChannel')
  async handleChannelData(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    try {
      const channel = await this.chatService.getChannelData(channelId);
      this.userJoinRoom(client.id, `channel_${channel.id}`);

      this.server.to(client.id).emit('listeningChannelInfo', {
        func: 'listeningChannelInfo',
        code: 200,
        message: `채팅 방 정보를 보냈습니다.`,
        data: channel,
      });

      return this.returnMessage('getChannel', 200, '채널 정보', channel, false);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('getChannelWithUser')
  async handleChannelUserList(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    try {
      const channel = await this.chatService.getChannelUserList(channelId);
      return this.returnMessage('getChannelWithUser', 200, '채널 정보', channel, false);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   * createChannel 방 생성
   * updateChannel 방 업데이트
   * deleteChannel 방 삭제
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { name: string; privacy: string; userId: number; password?: string },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('createChannel', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /** 방 정보 생성 */
      const dbUser = await this.usersService.getUserWithoutFriends(data.userId);
      const createChannelDto: CreateChannelDto = {
        name: data.name,
        privacy: data.privacy,
        owner: dbUser,
        users: [dbUser],
      };
      /** 비밀번호가 있는지 확인 */
      if (data.password) {
        createChannelDto.password = data.password;
      }
      /** 방 생성 */
      const channel = await this.chatService.createChannel(createChannelDto);

      /** 방 조인 */
      const roomId = `channel_${channel.id}`;
      this.userJoinRoom(client.id, roomId);

      /** client.id에게 방 전체 정보 보내기 */
      this.listeningChannelInfo(channel, roomId);

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
        const memoryUsers = this.chatUsers.getUsers();
        for (let i = 0; i < memoryUsers.length; i++) {
          this.listeningChannelList(memoryUsers[i].socketId, memoryUsers[i].id);
        }
      } else {
        this.listeningChannelList(memoryUser.socketId, memoryUser.id);
      }

      return this.returnMessage('createChannel', 200, '채널 생성되었습니다.', channel, true);
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('updateChannel')
  async handleUpdateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      channelId: number;
      name: string;
      privacy: string;
      password?: string;
      restrictionDuration?: number;
    },
  ) {
    /** 메모리 검사 */
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /** 데이터 정제 */
      const dbChannel = await this.chatService.getChannelData(data.channelId);
      let createChannelDto: CreateChannelDto = {
        name: data.name,
        privacy: data.privacy,
        owner: dbChannel.owner,
        users: dbChannel.users,
      };
      if (data.password) {
        createChannelDto.password = data.password;
      }
      if (data.restrictionDuration) {
        createChannelDto.restrictionDuration = data.restrictionDuration;
      }

      /** 채널 수정 */
      const channel = await this.chatService.updateChannel(data.channelId, createChannelDto);
      const roomId = `channel_${channel.id}`;

      /** client.id에게 방 전체 정보 보내기 */
      this.listeningChannelInfo(channel, roomId);

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
        const memoryUsers = this.chatUsers.getUsers();
        for (let i = 0; i < memoryUsers.length; i++) {
          this.listeningChannelList(memoryUsers[i].socketId, memoryUsers[i].id);
        }
      } else {
        const memoryUsers = this.chatUsers.getUsers();
        for (let i = 0; i < memoryUsers.length; i++) {
          this.listeningChannelList(roomId, memoryUsers[i].id);
        }
      }

      return this.returnMessage('updateChannel', 200, '채널 수정되었습니다.', channel, true);
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('deleteChannel', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      let channel = await this.chatService.getChannelData(channelId);
      const roomId = `channel_${channelId}`;

      /** 채널 나가기 */
      let memoryUsers = this.chatUsers.getUsers();
      for (let i = 0; i < memoryUsers.length; i++) {
        if (await this.chatService.userIsInChannel(channelId, memoryUsers[i].id))
          this.chatUsers.removeRoomFromUser(memoryUsers[i].socketId, roomId);
      }

      /** 나간 것 알리기 */
      this.server.to(roomId).emit('listeningChannelDeleted', {
        func: 'listeningChannelDeleted',
        code: 200,
        message: `삭제된 채널 정보.`,
        data: {
          deleteChannelId: channelId,
        },
      });

      this.server.socketsLeave(roomId);
      channel = await this.chatService.deleteChannel(channelId);

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      for (let i = 0; i < memoryUsers.length; i++) {
        this.listeningChannelList(memoryUsers[i].socketId, memoryUsers[i].id);
      }

      return this.returnMessage('deleteChannel', 200, '채널이 삭제되었습니다.');
    } catch (e) {
      this.chatError(client, e);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   * openChannel 방 열기
   * joinChannel 방 접속
   * leaveChannel 방 떠나기
   */
  @SubscribeMessage('isJoinPossible')
  async handleOpenChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
  ) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const isBanned = await this.chatService.checkIfUserIsBanned(channelId, userId);
      this.server.to(client.id).emit('listeningJoinPossible', {
        func: 'isJoinPossible',
        code: 200,
        message: `입장 가능합니다`,
      });
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /** 확인 */
      let channel = await this.chatService.getChannelData(channelId);
      const roomId = `channel_${channelId}`;
      if (await this.chatService.userIsInChannel(channelId, userId)) {
        /** 내가 다른 사람을 초대 했는데 이미 했다면 */
        if (memoryUser.id !== userId) {
          throw Error('이미 초대했습니다.');
        }

        /** 이미 초대가 됐는데 리스트에서 접속한다면 */
        this.userJoinRoom(client.id, roomId);
        this.listeningChannelInfo(channel, roomId);
        return this.returnMessage('joinChannel', 200, '이미 채널에 들어왔습니다');
      }

      /** 새로 채널 조인 */
      const dbAnother = await this.chatService.addUserToChannel(channel, userId);
      const message = await this.chatService.addMessageToChannel({
        content: `${dbAnother.username} joined group`,
        channel,
      });
      this.userJoinRoom(client.id, roomId);
      /** client.id에게 방 전체 정보 보내기 */
      channel = await this.chatService.getChannelData(channelId);
      this.listeningChannelInfo(channel, roomId);

      /** 다른 모든 사람에게 알리기 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
        const memoryUsers = this.chatUsers.getUsers();
        for (let i = 0; i < memoryUsers.length; i++) {
          this.listeningChannelList(memoryUsers[i].socketId, memoryUsers[i].id);
        }
      } else {
        const memoryAnother = this.chatUsers.getUserByNickname(dbAnother.nickname);
        if (memoryAnother) {
          this.listeningChannelList(memoryAnother.socketId, dbAnother.id);
        }
      }

      return this.returnMessage('joinChannel', 200, '채널에 들어왔습니다');
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @SubscribeMessage('joinProtected')
  async handleJoinProtectedChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      channelId,
      userId,
      password,
    }: {
      channelId: number;
      userId: number;
      password: string;
    },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinProtected', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /* If password is wrong, raise an Error */
      await this.chatService.checkChannelPassword(channelId, password);
      this.handleJoinChannel(client, { channelId, userId });
      return this.returnMessage('joinProtected', 200, '비밀번호가 일치합니다.');
    } catch (e) {
      this.chatError(client, e);
      return this.returnMessage('joinProtected', 400, '비밀번호가 틀립니다.');
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      let channel = await this.chatService.getChannelData(channelId);

      /** 채널에 이미 유저가 없는 경우 */
      if (!(await this.chatService.userIsInChannel(channelId, userId))) {
        return this.returnMessage('leaveChannel', 400, '채널에 유저가 없습니다');
      }

      /** 채널에서 유저 삭제 */
      const dbUser = await this.chatService.removeUserFromChannel(channel, userId);
      const roomId = `channel_${channelId}`;
      this.userLeaveRoom(client.id, roomId);

      /** 나간 유저에게 리스트 돌려주기 */
      const message = await this.chatService.addMessageToChannel({
        content: `${dbUser.username} left group`,
        channel,
      });
      this.listeningChannelList(memoryUser.socketId, memoryUser.id);

      /** 다른 사람에게 공개적으로 알려줄 때 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
      }

      /** 방에 속한 사람에게 리스트 보내주기 */
      const memoryUsers = this.chatUsers.getUsers();
      channel = await this.chatService.getChannelData(channelId);
      for (let i = 0; i < memoryUsers.length; i++) {
        this.listeningChannelList(roomId, memoryUsers[i].id);
        this.listeningChannelInfo(channel, roomId);
      }

      return this.returnMessage('leaveChannel', 200, '채널에서 나왔습니다.');
    } catch (e) {
      this.chatError(client, e);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   * 채널에 메시지 보내기
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('sendMessage')
  async handleGmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; channelId: number; userId: number },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('sendMessage', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (!data.userId) {
      throw new WsException('Anonymous messages not allowed.');
    }

    try {
      /** 데이터 생성 */
      const dbchannel = await this.chatService.getChannelData(data.channelId);
      if (!dbchannel) {
        throw new WsException('채널이 없습니다');
      }
      const dbUser = await this.usersService.getUserWithoutFriends(data.userId);
      if (!dbUser) {
        throw new WsException('유저가 없습니다');
      }

      const createChannelDto: CreateMessageDto = {
        content: data.message,
        channel: dbchannel,
        author: dbUser,
      };

      /** 뮤트 확인 */
      await this.chatService.checkIfUserIsMuted(createChannelDto.channel.id, createChannelDto.author.id);

      /** 메시지 생성 */
      const message = await this.chatService.addMessageToChannel(createChannelDto);

      /** 클라이언트 전송 */
      this.server.to(`channel_${dbchannel.id}`).emit('listeningMessage', {
        func: 'sendMessage',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          author: dbUser,
        },
      });

      this.logger.log(`New message in Channel [${dbchannel.id}]: ${message.content}`);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   *
   *
   *

   *
   *
   *
   *
   *
   *
   *
   *
   * 채널에 규칙 설정
   */
  @SubscribeMessage('makeAdmin')
  async handleMakeAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      channelId,
      ownerId,
      userId,
    }: {
      channelId: number;
      ownerId: number;
      userId: number;
    },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (ownerId === userId) {
      return this.returnMessage('makeAdmin', 400, 'Owner는 admin가 될 수 없습니다.');
    }
    try {
      let dbChannel = await this.chatService.getChannelData(channelId);
      if (dbChannel.owner.id != ownerId) {
        throw new Error('owner만 임명할 수 있습니다.');
      }

      /** 어드민 추가하기 */
      const admin = await this.chatService.addAdminToChannel(dbChannel, userId);
      const owner = await this.usersService.getUserWithoutFriends(ownerId);

      /** 어드민 추가 메시지 보내기 */
      const message = await this.chatService.addMessageToChannel({
        content: `${owner.nickname}은 admin입니다`,
        channel: dbChannel,
        author: owner,
      });

      /** 방 정보 보내기 */
      dbChannel = await this.chatService.getChannelData(channelId);
      const roomId = `channel_${dbChannel.id}`;
      this.listeningChannelInfo(dbChannel, roomId);

      /** 메시지 보내기 */
      this.server.to(`channel_${dbChannel.id}`).emit('listeningMessage', {
        func: 'sendMessage',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          author: owner,
        },
      });
      this.logger.log(`User [${owner.nickname}] is now admin in Channel [${dbChannel.name}]`);
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @SubscribeMessage('removeAdmin')
  async handleRemoveAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      channelId,
      ownerId,
      userId,
    }: {
      channelId: number;
      ownerId: number;
      userId: number;
    },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (ownerId === userId) {
      throw new WsException('Owner and admin are separate roles.');
    }
    try {
      let dbChannel = await this.chatService.getChannelData(channelId);
      if (dbChannel.owner.id != ownerId) {
        throw new Error('Insufficient Privileges');
      }

      /** 어드민 제거 */
      const owner = await this.usersService.getUserWithoutFriends(ownerId);
      const admin = await this.chatService.removeAdminFromChannel(dbChannel, userId);

      /** 어드민 제거 메시지 보내기 */
      const message = await this.chatService.addMessageToChannel({
        content: `${admin.nickname}은 더 이상 admin이 아닙니다`,
        channel: dbChannel,
        author: owner,
      });

      /** 방 정보 보내기 */
      dbChannel = await this.chatService.getChannelData(channelId);
      const roomId = `channel_${dbChannel.id}`;
      this.listeningChannelInfo(dbChannel, roomId);

      /** 메시지 보내기 */
      this.server.to(`channel_${dbChannel.id}`).emit('listeningMessage', {
        func: 'sendMessage',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          author: owner,
        },
      });
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @SubscribeMessage('kickUser')
  async handleKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      channelId,
      adminId,
      userId,
    }: {
      channelId: number;
      adminId: number;
      userId: number;
    },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (adminId === userId) {
      throw new WsException('If you want to leave the channel, go to Channel settings.');
    }
    try {
      const admin = this.chatUsers.getUserById(adminId);
      const channel = await this.chatService.getChannelData(channelId);

      /** 추방 */
      const user = await this.chatService.kickUser(channel, adminId, userId);
      const message = await this.chatService.addMessageToChannel({
        content: `${admin.nickname} kicked ${user.username}`,
        channel,
      });

      const roomId = `channel_${channelId}`;
      const chatUser = this.chatUsers.getUserById(userId);
      if (chatUser) {
        this.server.to(chatUser.socketId).emit('kickedFromChannel', `You have been kicked from ${channel.name}.`);
        this.userLeaveRoom(chatUser.socketId, roomId);
      }

      this.server.to(roomId).emit('userKicked', message);
      /* If the channel is visible to everyone, inform every client */
      if (channel.privacy !== 'private') {
        this.server.emit('peopleCountChanged', channel);
      }
      this.logger.log(`User [${userId}] was kicked from Channel [${channelId}]`);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('punishUser')
  async handlePunishUser(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      channelId,
      adminId,
      userId,
      type,
    }: {
      channelId: number;
      adminId: number;
      userId: number;
      type: string;
    },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }
    if (adminId === userId) {
      throw new WsException("Don't be so mean to yourself. :(");
    }

    try {
      let dbChannel = await this.chatService.getChannelData(channelId);
      const admin = await this.usersService.getUserWithoutFriends(adminId);

      /** 처벌 주기 */
      const content = await this.chatService.punishUser(dbChannel, adminId, userId, type);

      const memoryAnother = this.chatUsers.getUserById(userId);
      if (type == 'ban') {
        this.server.to(memoryAnother.socketId).emit('listeningBan', {
          func: 'punishUser',
          code: 200,
          message: `${dbChannel.name}에서 추방당했습니다.`,
          data: memoryAnother,
        });
      }

      /** 알리기 */
      // const chatUser = this.chatUsers.getUserById(userId);
      // this.server.to(client.id).emit('userPunished');
      // if (chatUser) {
      //   this.server.to(chatUser.socketId).emit('punishedInChannel', content);
      // }

      /** 처벌 메시지 보내기 */
      const message = await this.chatService.addMessageToChannel({
        content: content,
        channel: dbChannel,
        author: admin,
      });

      /** 메시지 보내기 */
      this.server.to(`channel_${dbChannel.id}`).emit('listeningMessage', {
        func: 'sendMessage',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          author: admin,
        },
      });
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   * Game-related
   */
  @SubscribeMessage('userGameStatus')
  async handleUserGameStatus(@ConnectedSocket() client: Socket, @MessageBody() { isPlaying }: { isPlaying: boolean }) {
    const user = this.chatUsers.getUser(client.id);

    if (user) {
      if (isPlaying) {
        user.setUserStatus(UserStatus.PLAYING);
      } else {
        user.setUserStatus(UserStatus.ONLINE);
      }
      this.server.emit('updateUserStatus', {
        userId: user.id,
        status: UserStatus[user.status],
      });
    }
  }

  /**
   * 게임 초대 후 수락할 때 초대한 사람이 못기다리고 나가버리면... 오류
   * @param client
   * @param param1
   */
  @SubscribeMessage('acceptPongInvite')
  async handleAcceptPongInvite(@ConnectedSocket() client: Socket, @MessageBody() { roomId }: { roomId: string }) {
    try {
      this.pongGateway.setInviteRoomToReady(roomId);
      this.server.to(client.id).emit('listeningInviteGame', {
        func: 'sendPongInvite',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          roomId,
        },
      });
      return this.returnMessage('acceptPongInvite', 200, '게임 초대를 수락했습니다.');
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('sendPongInvite')
  async handleSendPongInvite(@ConnectedSocket() client: Socket, @MessageBody() { anotherId }: { anotherId: number }) {
    try {
      const memorySender = this.chatUsers.getUser(client.id);
      const memoryReceiver = this.chatUsers.getUserById(anotherId);

      /** 게임 방이 존재하는지 확인 */
      /** 상대방이 게임중이면 chatError */
      this.pongGateway.roomAlreadyExists(memorySender.id, anotherId);

      /** 초대방 만들기 */
      const roomId = await this.pongGateway.createInviteRoom(
        { id: memorySender.id, nickname: memorySender.nickname } as User,
        anotherId,
      );
      this.logger.log(`sendPongInvite: createInviteRoom: ${roomId}`);

      /** 방 정보 */
      this.server.to(client.id).emit('listeningInviteGame', {
        func: 'sendPongInvite',
        code: 200,
        message: `메시지를 보냈습니다.`,
        data: {
          roomId,
        },
      });

      /** DM 보내기 */
      const dm: any = await this.handleCreateDm(client, { anotherId });
      await this.handleDmSubmit(client, {
        DMId: dm.data,
        authorId: memorySender.id,
        message: '게임 한판 고고',
        type: 'invite',
        roomId: roomId,
      });

      return this.returnMessage('sendPongInvite', 200, '게임 초대를 보냈습니다.');

      // /** DM방 생성 */
      // let DM = await this.chatService.checkIfDmExists(senderId, anotherId);
      // if (!DM) {
      //   DM = await this.chatService.createDm({
      //     users: [{ id: senderId }, { id: anotherId }],
      //   } as CreateDirectMessageDto);

      //   if (memoryReceiver) {
      //     this.userJoinRoom(memoryReceiver.socketId, `dm_${DM.id}`);
      //     this.server.to(memoryReceiver.socketId).emit('dmCreated');
      //   }
      // }
      // if (memoryReceiver) {
      //   this.server
      //     .to(memoryReceiver.socketId)
      //     .emit('chatInfo', `${memorySender.nickname} wants to play Pong! Open your DM and accept the challenge!`);
      // }

      // /** 메시지 보내기 */
      // const message = await this.chatService.addMessageToDm({
      //   content: "Let's play!",
      //   author: { id: senderId },
      //   type: 'invite',
      //   roomId,
      //   DM,
      // } as CreateMessageDto);
      // this.server.to(`dm_${DM.id}`).emit('newPongInvite', { message });
    } catch (e) {
      console.log(e);
      this.server.to(client.id).emit('chatError', e.message);
    }
  }
}
