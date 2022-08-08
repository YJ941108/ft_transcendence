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
import { send } from 'process';
import { Server, Socket } from 'socket.io';
import { UserStatus } from 'src/enums/games.enum';
import { CreateChannelDto } from '../channel/dto/create-channel.dto';
import { UpdateChannelDto } from '../channel/dto/update-channel.dto';
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
    if (memoryUser) {
      const nickname = memoryUser.nickname;
      return this.returnMessage('joinChat', 400, `${client.id}: ${nickname}:가 채팅 소켓에 이미 접속했습니다`);
    }

    /** 유저 메모리에 추가 */
    memoryUser = new ChatUser(newUser.id, newUser.nickname, client.id);
    this.chatUsers.addUser(memoryUser);

    try {
      await this.listeningGetUsers(client.id, 'handleDiscoonection');
      await this.listeningMe(client.id, 'handleDiscoonection');

      const dmList = await this.usersService.getUserWithDirectMessages(memoryUser.id);
      this.listeningDMRoomList(client.id, 'joinChat', memoryUser);
      await this.listeningChannelList(client, memoryUser.id);

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
    this.server.to(socketId).emit('listeningDMRoomInfo', {
      func: 'listeningDMRoomInfo',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningGetUsers`,
      data: dm,
    });
    this.logger.log({
      func: 'listeningDMRoomInfo',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningGetUsers`,
      data: dm,
    });
  }

  async listeningDMRoomList(socketId: string, functionName: string, memoryUser?: ChatUser): Promise<void> {
    const DMRooms = await this.chatService.getUserDMRooms(memoryUser.id);
    for (const DMRoom of DMRooms) {
      this.userJoinRoom(socketId, `dm_${DMRoom.id}`);
    }

    this.server.to(socketId).emit('listeningDMRoomList', {
      func: 'listeningDMRoomList',
      code: 200,
      message: `[${socketId}][${memoryUser.nickname}]: ${functionName}->listeningGetUsers`,
      data: DMRooms,
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
    const dbAnother = await this.usersService.getUserWithoutFriends(data.anotherId);
    if (!dbAnother) {
      return this.returnMessage('createDMRoom', 400, '상대방 계정이 틀렸습니다');
    }
    const dbUserAnother: CreateDirectMessageDto = {
      users: [dbUser, dbAnother],
    };

    try {
      let dm = await this.chatService.checkIfDmExists(dbUserAnother.users[0].id, dbUserAnother.users[1].id);

      if (!dm) {
        dm = await this.chatService.createDm(dbUserAnother);

        const friend = dbUserAnother.users.find((dmUser) => dmUser.id !== memoryUser.id);
        const friendUser = this.chatUsers.getUserById(friend.id);

        /**
         * 상대방에게 방 만든걸 알려줘야함 그래서 상대방이 getUserDMs를 해야 함
         */
        if (friendUser) {
          this.userJoinRoom(friendUser.socketId, `dm_${dm.id}`);
          this.listeningDMRoomInfo(friendUser.socketId, 'createDMRoom', memoryUser, dm);
        }
      }
      this.userJoinRoom(client.id, `dm_${dm.id}`);
      this.listeningDMRoomInfo(client.id, 'createDMRoom', memoryUser, dm);

      const memoryUsers = this.chatUsers.getUsers();
      for (let i = 0; i < memoryUsers.length; i++) {
        this.listeningDMRoomList(memoryUsers[i].socketId, 'listeningDMRoomList', memoryUser);
      }
      return this.returnMessage('createDMRoom', 200, 'listeningDMRoomInfo, listeningDMRoomList');
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
    this.listeningDMRoomList(client.id, 'listeningDMRoomList', memoryUser);
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
    @MessageBody() data: { DMId: number; authorId: number; message: string },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }
    const DM = await this.chatService.getDmData(data.DMId);
    const author = await this.usersService.getUserWithoutFriends(data.authorId);

    const message: CreateMessageDto = { DM, author, content: data.message };

    try {
      const sendMessage = await this.chatService.addMessageToDm(message);
      const emitData = {
        message: sendMessage.content,
        author: sendMessage.author,
        DMId: sendMessage.DM.id,
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
      this.listeningDMRoomList(client.id, 'sendDMMessage', memoryUser);

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
  async listeningChannelList(client: Socket, dbId?: number) {
    const channels = await this.chatService.getUserChannels(dbId);

    this.server.to(client.id).emit('listeningChannelList', {
      func: 'listeningChannelList',
      code: 200,
      message: `채팅 방 리스트를 보냈습니다.`,
      data: channels,
    });
  }

  async listeningChannelInfo(client: Socket, channel: Channel, roomId?: string) {
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
      this.server.to(client.id).emit(``);
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
    @MessageBody() data: { name: string; privacy: string; userId: number },
  ) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('createChannel', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /** 방 생성 */
      const dbUser = await this.usersService.getUserWithoutFriends(data.userId);
      const createChannelDto: CreateChannelDto = {
        name: data.name,
        privacy: data.privacy,
        owner: dbUser,
        users: [dbUser],
      };
      const channel = await this.chatService.createChannel(createChannelDto);

      /** 방 조인 */
      const roomId = `channel_${channel.id}`;
      this.userJoinRoom(client.id, roomId);

      /** 방 전체 정보 보내기 */
      await this.listeningChannelList(client, memoryUser.id);

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
        this.listeningChannelInfo(client, channel);
      } else {
        this.listeningChannelInfo(client, channel, roomId);
      }
    } catch (e) {
      this.chatError(client, e);
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('updateChannel')
  async handleUpdateChannel(@ConnectedSocket() client: Socket, @MessageBody() data: UpdateChannelDto) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.updateChannel((data as any).id, data);
      const roomId = `channel_${channel.id}`;

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.emit('listeningChannelInfo', channel);
      } else {
        this.server.to(roomId).emit('listeningChannelInfo', channel);
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    let memoryUser = this.chatUsers.getUserBySocketId(client.id);
    if (!memoryUser) {
      return this.returnMessage('deleteChannel', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.deleteChannel(channelId);
      const roomId = `channel_${channelId}`;

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.emit('listeningChannelDeleted', channelId);
      } else {
        this.server.to(roomId).emit('listeningChannelDeleted', channelId);
        this.server.socketsLeave(roomId);
      }

      return this.returnMessage('deleteChannel', 200, '채널이 삭제되었습니다.');
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
   * openChannel 방 열기
   * joinChannel 방 접속
   * leaveChannel 방 떠나기
   */
  @SubscribeMessage('isJoinChannel')
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
      if (isBanned) {
        return this.returnMessage('isJoinChannel', 400, '방에서 밴 되었습니다.');
      }
      return this.returnMessage('isJoinChannel', 200, '방에 입장 가능합니다.');
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
  ) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.getChannelData(channelId);
      if (await this.chatService.userIsInChannel(channelId, userId)) {
        return this.returnMessage('joinChannel', 200, '이미 채널에 들어왔습니다');
      }

      const user = await this.chatService.addUserToChannel(channel, userId);
      const message = await this.chatService.addMessageToChannel({
        content: `${user.username} joined group`,
        channel,
      });
      const roomId = `channel_${channelId}`;

      /* If the channel is visible to everyone, inform every client */
      if (channel.privacy !== 'private') {
        this.server.emit('listeningChannel', channel);
      }
      this.userJoinRoom(client.id, roomId);
      return this.returnMessage('joinChannel', 200, '채널에 들어왔습니다', channel);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('joinChannelProtected')
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      /* If password is wrong, raise an Error */
      await this.chatService.checkChannelPassword(channelId, password);
      const isInChan = await this.chatService.userIsInChannel(channelId, userId);
      if (!isInChan) {
        this.handleJoinChannel(client, { channelId, userId });
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
  ) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.getChannelData(channelId);
      if (!(await this.chatService.userIsInChannel(channelId, userId))) {
        return this.returnMessage('leaveChannel', 400, '채널에 유저가 없습니다');
      }

      const user = await this.chatService.removeUserFromChannel(channel, userId);
      const message = await this.chatService.addMessageToChannel({
        content: `${user.username} left group`,
        channel,
      });
      const roomId = `channel_${channelId}`;

      this.userLeaveRoom(client.id, roomId);
      this.server.to(roomId).emit('leftChannel', { message, userId });

      /* If the channel is visible to everyone, inform every client */
      if (channel.privacy !== 'private') {
        this.server.emit('peopleCountChanged', channel);
      }
      return this.returnMessage('leaveChannel', 200, '채널에서 나왔습니다.');
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
   * 채널에 메시지 보내기
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('sendMessage')
  async handleGmSubmit(@ConnectedSocket() client: Socket, @MessageBody() data: CreateMessageDto) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      if (!data.author) {
        throw new WsException('Anonymous messages not allowed.');
      }
      await this.chatService.checkIfUserIsMuted(data.channel.id, data.author.id);
      const message = await this.chatService.addMessageToChannel(data);
      const channel = message.channel;

      this.server.to(`channel_${channel.id}`).emit('listeningMessage', { message });
      this.logger.log(`New message in Channel [${channel.id}]`);
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    if (ownerId === userId) {
      return this.returnMessage('makeAdmin', 400, 'Owner and admin are separate roles.');
    }

    try {
      const channel = await this.chatService.getChannelData(channelId);

      if (channel.owner.id != ownerId) {
        throw new Error('Insufficient Privileges');
      }
      await this.chatService.addAdminToChannel(channel, userId);
      this.server.to(client.id).emit('adminAdded');
      this.logger.log(`User [${userId}] is now admin in Channel [${channel.name}]`);

      const chatUser = this.chatUsers.getUserById(userId);

      if (chatUser) {
        this.server.to(chatUser.socketId).emit('chatInfo', `You are now admin in ${channel.name}.`);
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    if (ownerId === userId) {
      throw new WsException('Owner and admin are separate roles.');
    }
    try {
      const channel = await this.chatService.getChannelData(channelId);

      if (channel.owner.id != ownerId) {
        throw new Error('Insufficient Privileges');
      }
      await this.chatService.removeAdminFromChannel(channel, userId);
      this.server.to(client.id).emit('adminRemoved');
      this.logger.log(`User [${userId}] no longer admin in Channel [${channel.name}]`);

      const chatUser = this.chatUsers.getUserById(userId);

      if (chatUser) {
        this.server.to(chatUser.socketId).emit('chatInfo', `You are no longer admin in ${channel.name}.`);
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    if (adminId === userId) {
      throw new WsException('If you want to leave the channel, go to Channel settings.');
    }

    try {
      const admin = this.chatUsers.getUserById(adminId);
      const channel = await this.chatService.getChannelData(channelId);
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    if (adminId === userId) {
      throw new WsException("Don't be so mean to yourself. :(");
    }
    try {
      const channel = await this.chatService.getChannelData(channelId);
      const message = await this.chatService.punishUser(channel, adminId, userId, type);
      const chatUser = this.chatUsers.getUserById(userId);

      this.server.to(client.id).emit('userPunished');
      if (chatUser) {
        this.server.to(chatUser.socketId).emit('punishedInChannel', message);
      }
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

  @SubscribeMessage('acceptPongInvite')
  async handleAcceptPongInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId, userId }: { roomId: string; userId: number },
  ) {
    try {
      this.pongGateway.setInviteRoomToReady(roomId);
      this.logger.log(`Pong invite accepted by User [${userId}]`);

      this.server.to(client.id).emit('redirectToGame');
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('sendPongInvite')
  async handleSendPongInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() { senderId, receiverId }: { senderId: number; receiverId: number },
  ) {
    try {
      this.pongGateway.roomAlreadyExists(senderId, receiverId);

      let DM = await this.chatService.checkIfDmExists(senderId, receiverId);
      const sender = this.chatUsers.getUser(client.id);
      const receiver = this.chatUsers.getUserById(receiverId);

      if (!DM) {
        DM = await this.chatService.createDm({
          users: [{ id: senderId }, { id: receiverId }],
        } as CreateDirectMessageDto);

        if (receiver) {
          this.userJoinRoom(receiver.socketId, `dm_${DM.id}`);
          this.server.to(receiver.socketId).emit('dmCreated');
        }
      }
      if (receiver) {
        this.server
          .to(receiver.socketId)
          .emit('chatInfo', `${sender.nickname} wants to play Pong! Open your DM and accept the challenge!`);
      }

      const roomId = await this.pongGateway.createInviteRoom(
        { id: sender.id, nickname: sender.nickname } as User,
        receiverId,
      );

      const message = await this.chatService.addMessageToDm({
        content: "Let's play!",
        author: { id: senderId },
        type: 'invite',
        roomId,
        DM,
      } as CreateMessageDto);

      this.server.to(`dm_${DM.id}`).emit('newPongInvite', { message });
      this.logger.log(`New Pong invite in DM [${message.DM.id}]`);
      this.server.to(client.id).emit('launchInviteGame');
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }
}
