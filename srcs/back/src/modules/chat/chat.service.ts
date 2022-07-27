import { Injectable } from '@nestjs/common';
import { compare as comparePassword } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { ChannelService } from './channel.service';
import { DirectMessageService } from './direct-message.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entity/channel.entity';
import { DirectMessage } from './entity/direct-message.entity';
import { MessageService } from './message.service';

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
    const channel = await this.channelService.findOne(channelId.toString());

    if (!channel) {
      throw new Error('No channel found.');
    }
    const isInChan = !!channel.users.find((user) => {
      return user.id === userId;
    });
    return isInChan;
  }

  async checkChannelPassword(channelId: number, password: string) {
    const channel = await this.channelService.findOne(channelId.toString());

    if (channel && channel.privacy === 'protected') {
      const chanPassword = await this.channelService.getChannelPassword(channelId.toString());
      const passIsValid = await comparePassword(password, chanPassword);

      if (passIsValid) return;
      throw new Error('Invalid password');
    }
    throw new Error('Invalid operation');
  }

  async checkIfUserIsBanned(channelId: number, userId: number) {
    const isBanned = await this.channelService.findOutIfUserIsBanned(channelId, userId);

    if (isBanned) {
      throw new Error('You were banned from this group.');
    }
  }

  async checkIfUserIsMuted(channelId: number, userId: number) {
    const isMuted = await this.channelService.findOutIfUserIsMuted(channelId, userId);

    if (isMuted) {
      throw new Error('Muted users are not allowed to post.');
    }
  }

  /* Getters */
  async getUserChannels(userId: number) {
    const channels = await this.channelService.findAll();

    if (!channels) {
      throw new Error('No channel found.');
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
    return await this.channelService.findOne(channelId.toString());
  }

  async getChannelUserList(channelId: number) {
    return await this.channelService.getChannelUsers(channelId.toString());
  }

  /* Create/delete/update */
  async createChannel(createChannelDto: CreateChannelDto) {
    const res = await this.channelService.create(createChannelDto);

    return await this.channelService.findOne(res.id.toString());
  }

  async updateChannel(channelId: number, updateChannelDto: UpdateChannelDto) {
    return await this.channelService.update(channelId.toString(), updateChannelDto);
  }

  async deleteChannel(channelId: number) {
    return await this.channelService.remove(channelId.toString());
  }

  async addMessageToChannel(createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);

    if (createMessageDto.author) {
      const user = await this.usersService.getUser(createMessageDto.author.id);
      message.author = user;
    }
    return message;
  }

  async addUserToChannel(channel: Channel, userId: number) {
    const user = await this.usersService.getUser(userId);

    await this.channelService.update(channel.id.toString(), {
      users: [...channel.users, user],
    });
    return user;
  }

  async removeUserFromChannel(channel: Channel, userId: number) {
    try {
      await this.removeAdminFromChannel(channel, userId);
    } catch (e) {}

    const user = await this.usersService.getUser(userId);
    const filteredUsers = channel.users.filter((chanUser) => {
      return chanUser.id !== user.id;
    });

    await this.channelService.update(channel.id.toString(), {
      users: filteredUsers,
    });
    return user;
  }

  /* Owner operations */
  async addAdminToChannel(channel: Channel, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === userId;
    });

    if (!isAdmin) {
      const newAdmin = await this.usersService.getUser(userId);

      await this.channelService.update(channel.id.toString(), {
        admins: [...channel.admins, newAdmin],
      });
      return newAdmin;
    }
    throw new Error('User is already administrator');
  }

  async removeAdminFromChannel(channel: Channel, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === userId;
    });

    if (isAdmin) {
      const formerAdmin = await this.usersService.getUser(userId);
      const filteredAdmins = channel.admins.filter((chanAdmin) => {
        return chanAdmin.id !== formerAdmin.id;
      });

      await this.channelService.update(channel.id.toString(), {
        admins: filteredAdmins,
      });
      return formerAdmin;
    }
    throw new Error('User is not an administrator');
  }

  /* Admin operations */
  async kickUser(channel: Channel, adminId: number, userId: number) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === adminId;
    });
    if (channel.owner.id != adminId && !isAdmin) {
      throw new Error('Insufficient Privileges');
    }

    return await this.removeUserFromChannel(channel, userId);
  }

  async punishUser(channel: Channel, adminId: number, userId: number, type: string) {
    const isAdmin = !!channel.admins.find((admin) => {
      return admin.id === adminId;
    });
    if (channel.owner.id !== adminId && !isAdmin) {
      throw new Error('Insufficient Privileges');
    }
    if (type === 'ban') {
      await this.channelService.banUser(channel.id, userId, adminId);
      return `You have been banned from ${channel.name}.`;
    } else if (type === 'mute') {
      await this.channelService.muteUser(channel.id, userId, adminId);
      return `You have been muted in ${channel.name}.`;
    }
  }

  /**
   * Direct Messages
   */

  /* Getters */
  async getUserDms(userId: number) {
    const dms = await this.directMessageService.findAll();

    if (!dms) {
      throw new Error('No DM found.');
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
    return await this.directMessageService.findOne(dmId.toString());
  }

  async getFriendFromDm(dmId: number, userId: number) {
    const dm = await this.directMessageService.findOne(dmId.toString());

    return dm.users[0].id === userId ? dm.users[1] : dm.users[0];
  }

  async checkIfDmExists(userId1: string, userId2: string) {
    let existingDm: DirectMessage;

    try {
      existingDm = await this.usersService.getDirectMessage(userId1, userId2);
      return existingDm;
    } catch (e) {}
  }

  /* Create/delete/update */
  async createDm(createDirectMessageDto: CreateDirectMessageDto) {
    const res = await this.directMessageService.create(createDirectMessageDto);

    return await this.directMessageService.findOne(res.id.toString());
  }

  async addMessageToDm(createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);

    if (createMessageDto.author) {
      const user = await this.usersService.getUser(createMessageDto.author.id);
      message.author = user;
    }
    return message;
  }
}
