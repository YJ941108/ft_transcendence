import { Injectable } from '@nestjs/common';
import { compare as comparePassword } from 'bcryptjs';
import { ChannelService } from '../channel/channel.service';
import { CreateChannelDto } from '../channel/dto/create-channel.dto';
import { UpdateChannelDto } from '../channel/dto/update-channel.dto';
import { Channel } from '../channel/entities/channel.entity';
import { DirectMessageService } from '../direct-message/direct-message.service';
import { CreateDirectMessageDto } from '../direct-message/dto/create-direct-message.dto';
import { DirectMessage } from '../direct-message/entities/direct-message.entity';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { MessageService } from '../message/message.service';
import { UsersService } from '../users/users.service';
import { hash as hashPassword } from 'bcryptjs';

@Injectable()
export class ChatService {
  constructor(
    private readonly channelService: ChannelService,
    private readonly directMessageService: DirectMessageService,
    private readonly messageService: MessageService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Channels
   */

  /* Helpers */
  async userIsInChannel(channelId: number, userId: number) {
    const channel = await this.channelService.findOne(channelId);
    if (!channel) {
      throw new Error('채널을 찾을 수 없습니다');
    }

    const isInChan = !!channel.users.find((user) => {
      return user.id === userId;
    });
    return isInChan;
  }

  async checkChannelPassword(channelId: number, password: string) {
    const channel = await this.channelService.findOne(channelId);
    if (!channel) {
      throw new Error('채널을 찾을 수 없습니다');
    }
    if (!(channel.privacy === 'protected')) {
      throw new Error('Protected가 아닙니다.');
    }

    const hash = await this.channelService.getChannelPassword(channelId);
    const passIsValid = await comparePassword(password, hash);
    console.log(hash);
    console.log(password);
    console.log(passIsValid);
    if (!passIsValid) {
      throw new Error('비밀번호가 틀립니다');
    }
  }

  async checkIfUserIsBanned(channelId: number, userId: number): Promise<boolean> {
    const isBanned = await this.channelService.findOutIfUserIsBanned(channelId, userId);

    if (isBanned) {
      throw new Error('밴 되셨습니다');
    }

    return isBanned;
  }

  async checkIfUserIsMuted(channelId: number, userId: number) {
    const isMuted = await this.channelService.findOutIfUserIsMuted(channelId, userId);
    if (isMuted) {
      throw new Error('벙어리되셨습니다');
    }
  }

  /* Getters */
  async getUserChannels(userId: number) {
    const channels = await this.channelService.findAll();
    if (!channels) {
      throw new Error('채널을 찾을 수 없습니다');
    }

    const userChannels = channels.filter(
      (channel) =>
        !!channel.users.find((user) => {
          return user.id === userId;
        }) || channel.privacy !== 'private',
    );
    return userChannels;
  }

  async getChannelData(channelId: number) {
    return await this.channelService.findOne(channelId);
  }

  async getChannelUserList(channelId: number) {
    return await this.channelService.getChannelUsers(channelId.toString());
  }

  /* Create/delete/update */
  async createChannel(createChannelDto: CreateChannelDto) {
    const res = await this.channelService.create(createChannelDto);

    return await this.channelService.findOne(res.id);
  }

  async updateChannel(channelId: number, updateChannelDto: UpdateChannelDto) {
    return await this.channelService.update(channelId, updateChannelDto);
  }

  async deleteChannel(channelId: number) {
    return await this.channelService.remove(channelId);
  }

  async addMessageToChannel(createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);

    if (createMessageDto.author) {
      const user = await this.usersService.getUserWithFriends(createMessageDto.author.id);
      message.author = user;
    }
    return message;
  }

  async addUserToChannel(channel: Channel, userId: number) {
    const user = await this.usersService.getUserWithFriends(userId);

    await this.channelService.update(channel.id, {
      users: [...channel.users, user],
    });
    return user;
  }

  async removeUserFromChannel(channel: Channel, userId: number) {
    try {
      await this.removeAdminFromChannel(channel, userId);
    } catch (e) {}

    const user = await this.usersService.getUserWithFriends(userId);
    const filteredUsers = channel.users.filter((chanUser) => {
      return chanUser.id !== user.id;
    });

    await this.channelService.update(channel.id, {
      users: filteredUsers,
    });
    return user;
  }

  /* Owner operations */
  async addAdminToChannel(channel: Channel, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === userId;
    });
    if (isAdmin) {
      throw new Error('이미 관리자입니다');
    }

    const newAdmin = await this.usersService.getUserWithoutFriends(userId);

    await this.channelService.update(channel.id, {
      admins: [...channel.admins, newAdmin],
    });
    return newAdmin;
  }

  async removeAdminFromChannel(channel: Channel, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === userId;
    });
    if (!isAdmin) {
      throw new Error('관리자가 아닙니다');
    }
    const formerAdmin = await this.usersService.getUserWithFriends(userId);
    const filteredAdmins = channel.admins.filter((chanAdmin) => {
      return chanAdmin.id !== formerAdmin.id;
    });

    await this.channelService.update(channel.id, {
      admins: filteredAdmins,
    });
    return formerAdmin;
  }

  /* Admin operations */
  async kickUser(channel: Channel, adminId: number, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === adminId;
    });
    if (channel.owner.id != adminId && !isAdmin) {
      throw new Error('권한이 없어요');
    }
    return await this.removeUserFromChannel(channel, userId);
  }

  async punishUser(channel: Channel, adminId: number, userId: number, type: string) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === adminId;
    });
    if (channel.owner.id !== adminId && !isAdmin) {
      throw new Error('권한이 없어요');
    }

    const user = await this.usersService.getUserWithoutFriends(userId);

    if (type === 'ban') {
      await this.channelService.banUser(channel.id, userId, adminId);
      return `${user.nickname}는 ${channel.name}에서 ban 되었습니다.`;
    } else if (type === 'mute') {
      await this.channelService.muteUser(channel.id, userId, adminId);
      return `${user.nickname}는 ${channel.name}에서 mute 되었습니다.`;
    }
  }

  /**
   * Direct Messages
   */

  /* Getters */
  async getUserDMRooms(userId: number) {
    const dms = await this.directMessageService.findAll();

    if (!dms) {
      throw new Error('DM을 찾을 수 없습니다');
    }
    const userDms = dms.filter(
      (dm) =>
        !!dm.users.find((user) => {
          return user.id === userId;
        }),
    );
    return userDms;
  }

  async getDmData(dmId: number) {
    return await this.directMessageService.findOne(dmId);
  }

  async getFriendFromDm(dmId: number, userId: number) {
    const dm = await this.directMessageService.findOne(dmId);

    return dm.users[0].id === userId ? dm.users[1] : dm.users[0];
  }

  async checkIfDmExists(userId1: number, userId2: number) {
    let existingDm: DirectMessage;

    try {
      existingDm = await this.usersService.getDirectMessage(userId1, userId2);
      return existingDm;
    } catch (e) {}
  }

  /* Create/delete/update */
  async createDm(createDirectMessageDto: CreateDirectMessageDto) {
    const res = await this.directMessageService.create(createDirectMessageDto);

    return await this.directMessageService.findOne(res.id);
  }

  async addMessageToDm(createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);

    if (createMessageDto.author) {
      const user = await this.usersService.getUserWithFriends(createMessageDto.author.id);
      message.author = user;
    }
    return message;
  }
}
