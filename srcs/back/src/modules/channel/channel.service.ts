import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash as hashPassword } from 'bcryptjs';
import { Channel } from './entities/channel.entity';
import { PunishmentService } from '../punishment/punishment.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  private logger: Logger = new Logger('Channels Service');

  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    private readonly PunishmentService: PunishmentService,
  ) {}

  /**
   * Channel punishments
   */
  async findOutIfUserIsMuted(channelId: number, userId: number) {
    return await this.PunishmentService.isUserCurrentlyMuted(channelId, userId);
  }

  async findOutIfUserIsBanned(channelId: number, userId: number) {
    return await this.PunishmentService.isUserCurrentlyBanned(channelId, userId);
  }

  async banUser(channelId: number, punishedId: number, punisherId: number) {
    const isBanned = await this.PunishmentService.isUserCurrentlyBanned(channelId, punishedId);

    if (isBanned) {
      throw new Error('User is already banned.');
    }
    return this.PunishmentService.punishUser(channelId, punishedId, punisherId, 'ban', {
      reason: "Un méchant garçon, à n'en point douter.",
    });
  }

  async muteUser(channelId: number, punishedId: number, punisherId: number) {
    const isMuted = await this.PunishmentService.isUserCurrentlyMuted(channelId, punishedId);

    if (isMuted) {
      throw new Error('User is already muted.');
    }
    return this.PunishmentService.punishUser(channelId, punishedId, punisherId, 'mute', {
      reason: "Un méchant garçon, à n'en point douter.",
    });
  }

  /**
   * Used whenever a user wants to join a password-protected channel
   */
  async getChannelPassword(id: number) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select('channel.password')
      .where('channel.id = :id', { id })
      .getOne();

    return channel.password;
  }

  /**
   * To display the user list of a group
   */
  async getChannelUsers(id: string) {
    const channel = await this.channelsRepository.findOne(id, {
      relations: ['owner', 'users', 'admins', 'punishments', 'punishments.punishedUser'],
    });
    if (!channel) {
      throw new Error(`Channel [${id}] not found`);
    }

    const timeNow = new Date(Date.now());
    const activePunishements = channel.punishments.filter((punishment) => {
      return !punishment.endsAt || punishment.endsAt > timeNow;
    });

    channel.punishments = activePunishements;
    return channel;
  }

  async nameIsAvailable(name: string) {
    const channel = await this.channelsRepository.findOne({
      where: {
        name,
      },
    });
    return channel;
  }

  findAll() {
    return this.channelsRepository.find({
      relations: ['owner', 'users', 'admins', 'messages', 'messages.author'],
    });
  }

  async findOne(id: number) {
    const channel = await this.channelsRepository.findOne(id, {
      relations: ['owner', 'users', 'admins', 'messages', 'messages.author'],
    });
    if (!channel) {
      throw new Error(`Channel [${id}]이 존재하지 않습니다.`);
    }

    return channel;
  }

  async create(createChannelDto: CreateChannelDto) {
    /** 채널이 존재하는지 확인 */
    const existingChannel = await this.nameIsAvailable(createChannelDto.name);
    if (existingChannel) {
      throw new Error(`Group '${createChannelDto.name}' already exists. Choose another name.`);
    }

    /** 비밀번호가 있다면 해쉬적용 */
    if (createChannelDto.password) {
      createChannelDto.password = await hashPassword(createChannelDto.password, 10);
    }
    const channel = this.channelsRepository.create(createChannelDto);

    this.logger.log(`Create new channel [${channel.name}]`);

    return await this.channelsRepository.save(channel).catch(() => {
      throw new Error(`Group '${createChannelDto.name}' already exists. Choose another name.`);
    });
  }

  async update(id: number, updateChannelDto: UpdateChannelDto) {
    if (updateChannelDto.name) {
      const existingChannel = await this.nameIsAvailable(updateChannelDto.name);

      if (existingChannel && existingChannel.id !== id) {
        throw new Error(`Group '${updateChannelDto.name}' already exists. Choose another name.`);
      }
    }

    if (updateChannelDto.password) {
      updateChannelDto.password = await hashPassword(updateChannelDto.password, 10);
    }

    const channel = await this.channelsRepository.preload({
      id: +id,
      ...updateChannelDto,
    });

    if (!channel) {
      throw new Error(`Cannot update Channel [${id}]: Not found`);
    }
    this.logger.log(`Update channel [${channel.id}][${channel.name}]`);

    return this.channelsRepository.save(channel);
  }

  async remove(id: number) {
    const channel = await this.channelsRepository.findOne(id);

    if (!channel) {
      throw new Error(`Channel [${id}] not found`);
    }
    this.logger.log(`Remove channel [${channel.id}][${channel.name}]`);

    return this.channelsRepository.remove(channel);
  }
}
