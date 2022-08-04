import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../channel/entities/channel.entity';
import { UsersService } from '../users/users.service';
import { Punishment, PunishmentType } from './entities/punishment.entity';

type PunishmentOptions = {
  // durationInSeconds?: number;
  reason?: string;
};

type GetPunishmentOptions = {
  onlyType?: PunishmentType;
};

@Injectable()
export class PunishmentService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Punishment)
    private readonly PunishmentRepository: Repository<Punishment>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Punish a given user to restrict their permissions on a given channel
   *
   * @param channelId - The id of the channel the punishment applies to
   * @param punishedUserId - The id of the punishED user (the user that receives a punishment)
   * @param punisherUserId  - The id of the punishER user (the user that gives the punishment)
   * @param options - Optional parameters such as punishment reason
   * @returns The punishment as saved in database
   */
  async punishUser(
    channelId: number,
    punishedUserId: number,
    punisherUserId: number,
    type: PunishmentType,
    options: PunishmentOptions = {},
  ) {
    const channel = await this.channelRepository.findOne(channelId);
    if (!channel) {
      throw new Error(`Could not punish user since there is no channel with id ${channelId}`);
    }

    const punishedUser = await this.usersService.getUserWithFriends(punishedUserId);
    if (!punishedUser) {
      throw new Error(`Could not punish user: no user with id ${punishedUserId}`);
    }

    const punisherUser = await this.usersService.getUserWithFriends(punisherUserId);
    if (!punisherUser) {
      throw new Error(`Could not punish user: no user with id ${punishedUserId}`);
    }

    const durationInSeconds = channel.restrictionDuration * 60;
    const punishmentStartDate = new Date();
    const punishmentEndDate = new Date(punishmentStartDate.getTime() + durationInSeconds * 1000);

    const punishment = this.PunishmentRepository.create({
      channel,
      punishedUser: punishedUser,
      punishedByUser: punisherUser,
      startsAt: punishmentStartDate,
      endsAt: punishmentEndDate,
      durationInSeconds,
      type,
      reason: options.reason,
    });

    return this.PunishmentRepository.save(punishment);
  }

  async getActiveUserPunishments(channelId: number, userId: number, options: GetPunishmentOptions = {}) {
    const channel = await this.channelRepository.findOne(channelId);
    if (!channel) {
      throw new Error(`Could not check punishment: no channel with id ${channelId}`);
    }

    const user = await this.usersService.getUserWithFriends(userId);
    if (!user) {
      throw new Error(`Could not check punishment: no user with id ${userId}`);
    }

    const userPunishments = await this.PunishmentRepository.createQueryBuilder('punishment')
      .leftJoin('punishment.punishedUser', 'punished')
      .leftJoin('punishment.punishedByUser', 'punisher')
      .leftJoin('punishment.channel', 'channel')
      .select([
        'punishment.startsAt',
        'punishment.type',
        'punishment.endsAt',
        'punishment.durationInSeconds',
        'punishment.reason',
        'punished.id',
        'channel.id',
        'punisher.id',
      ])
      .where(
        `
            channel.id = :channelId
            AND punished.id = :punishedId
            ${options.onlyType ? 'AND punishment.type = :punishmentType' : ''}
            AND (punishment.endsAt IS NULL OR punishment.endsAt > now())`,
        {
          channelId,
          punishedId: userId,
          ...(options.onlyType ? { punishmentType: options.onlyType } : {}),
        },
      )
      .orderBy('punishment.startsAt', 'DESC')
      .getMany();

    return userPunishments;
  }

  async isUserCurrentlyPunished(channelId: number, userId: number, options: GetPunishmentOptions = {}) {
    const channel = await this.channelRepository.findOne(channelId);
    if (!channel) {
      throw new Error(`Could check punishment: no channel with id ${channelId}`);
    }

    const user = await this.usersService.getUserWithFriends(userId);
    if (!user) {
      throw new Error(`Could not check punishment: no user with id ${userId}`);
    }

    const punishmentCount = await this.PunishmentRepository.createQueryBuilder('punishment')
      .leftJoin('punishment.punishedUser', 'punished')
      .leftJoin('punishment.punishedByUser', 'punisher')
      .leftJoin('punishment.channel', 'channel')
      .where(
        `
            channel.id = :channelId
            AND punished.id = :punishedId
            ${options.onlyType ? 'AND punishment.type = :punishmentType' : ''}
            AND (punishment.endsAt IS NULL OR punishment.endsAt > now())`,
        {
          channelId,
          punishedId: userId,
          ...(options.onlyType ? { punishmentType: options.onlyType } : {}),
        },
      )
      .getCount();

    return punishmentCount > 0;
  }

  async isUserCurrentlyMuted(channelId: number, userId: number) {
    return this.isUserCurrentlyPunished(channelId, userId, { onlyType: 'mute' });
  }

  async isUserCurrentlyBanned(channelId: number, userId: number) {
    return this.isUserCurrentlyPunished(channelId, userId, { onlyType: 'ban' });
  }
}
