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
import { UpdateChannelDto } from '../channel/dto/update-channel.dto';
import { CreateDirectMessageDto } from '../direct-message/dto/create-direct-message.dto';
import { CreateMessageDto } from '../message/dto/create-message.dto';
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

  constructor(private readonly chatService: ChatService, private readonly usersService: UsersService) {}

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
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    let user = this.chatUsers.getUser(client.id);
    if (!user) {
      return;
    }

    this.server.emit('listeningUser', {
      func: 'listeningUser',
      code: 200,
      message: `${user.nickname}가 채팅을 나갔습니다`,
      data: {
        userId: user.id,
        status: UserStatus[UserStatus.OFFLINE],
      },
    });

    this.logger.log(`handleDisconnect: ${user.nickname}`);
    this.chatUsers.removeUser(user);
  }

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
      message: `${user.nickname}가 채팅 소켓에 접속했습니다`,
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
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }

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
          this.server.to(friendUser.socketId).emit('listeningDMRoom', {
            func: 'listeningUser',
            code: 200,
            message: `${user.nickname}가 dm_${dm.id} DM방을 만들었습니다.`,
            data: dm,
          });
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
  @SubscribeMessage('joinDMRooms')
  async handleUserDms(@ConnectedSocket() client: Socket, @MessageBody() { userId }: { userId: number }) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }

    const DMRooms = await this.chatService.getUserDMRooms(userId);

    for (const DMRoom of DMRooms) {
      this.userJoinRoom(client.id, `dm_${DMRoom.id}`);
    }

    return this.returnMessage('joinDMRooms', 200, 'DM 리스트', DMRooms, false);
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
        message: `${message.DM.id}에서 메시지가 도착했습니다`,
        data: message,
      });
      return this.returnMessage('sendDM', 200, '메시지 보내기 성공', message, true);
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  /**
   * Channels
   */

  /**
   * 채널 데이터 획득
   * getChannels
   * getChannel
   * getChannelWithUser
   */
  @SubscribeMessage('getChannels')
  async handleUserChannels(@ConnectedSocket() client: Socket, @MessageBody() { userId }: { userId: number }) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
    }

    const channels = await this.chatService.getUserChannels(userId);
    for (const channel of channels) {
      this.userJoinRoom(client.id, `channel_${channel.id}`);
    }
    return this.returnMessage('getChannels', 200, '채널 리스트 정보', channels, false);
  }

  @SubscribeMessage('getChannel')
  async handleChannelData(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    try {
      const channel = await this.chatService.getChannelData(channelId);
      this.userJoinRoom(client.id, `channel_${channel.id}`);
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
   * createChannel 방 생성
   * updateChannel 방 업데이트
   * deleteChannel 방 삭제
   */
  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('createChannel')
  async handleCreateChannel(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChannelDto) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('createChannel', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.createChannel(data);
      const roomId = `channel_${channel.id}`;
      this.userJoinRoom(client.id, roomId);

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.socketsJoin(roomId);
        this.server.emit('listeningChannel', channel);
      } else {
        this.server.to(roomId).emit('listeningChannel', channel);
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @SubscribeMessage('updateChannel')
  async handleUpdateChannel(@ConnectedSocket() client: Socket, @MessageBody() data: UpdateChannelDto) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('joinChat', 400, '채팅 소켓에 유저가 없습니다');
    }

    try {
      const channel = await this.chatService.updateChannel((data as any).id, data);
      const roomId = `channel_${channel.id}`;

      /* 방이 비공개가 아니면 모두에게 알려야 함 */
      if (channel.privacy !== 'private') {
        this.server.emit('listeningChannelRoom', channel);
      } else {
        this.server.to(roomId).emit('listeningChannelRoom', channel);
      }
    } catch (e) {
      this.server.to(client.id).emit('chatError', e.message);
    }
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(@ConnectedSocket() client: Socket, @MessageBody() { channelId }: { channelId: number }) {
    let user = this.chatUsers.getUserBySocketId(client.id);
    if (!user) {
      return this.returnMessage('getChannels', 400, '채팅 소켓에 유저가 없습니다');
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
}
