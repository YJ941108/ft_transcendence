/**
 * @see https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts
 */

import { Channel } from 'src/modules/channel/entities/channel.entity';
import { DirectMessage } from 'src/modules/direct-message/entities/direct-message.entity';
import { Punishment } from 'src/modules/punishment/entities/punishment.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Games } from '../../games/games.entity';

/**
 *
 */
@Entity()
@Unique(['email'])
export class Users extends BaseEntity {
  /** 유저 index */
  @PrimaryGeneratedColumn()
  id: number;

  /** intraId */
  @Column({
    nullable: false,
  })
  username: string;

  /** email이 동일하면 Insert가 안된다 */
  @Column({
    nullable: false,
  })
  email: string;

  /** 닉네임은 변경 가능하지만 중복되면 안된다 */
  @Column({
    nullable: true,
  })
  nickname: string;

  /** 42api를 통해서 받은 프로필 사진 */
  @Column({
    nullable: true,
  })
  photo: string;

  /** two-factor authentication */

  @Column({
    nullable: true,
    default: false,
  })
  tfa: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  tfaCode: string;

  /** friends */
  @ManyToMany((type) => Users, (user) => user.friendsRequest)
  friendsRequestParents: Users[];

  @ManyToMany((type) => Users, (user) => user.friendsRequestParents)
  @JoinTable()
  friendsRequest: Users[];

  @ManyToMany((type) => Users, (user) => user.friends)
  friendsParents: Users[];

  @ManyToMany((type) => Users, (user) => user.friendsParents)
  @JoinTable()
  friends: Users[];

  @ManyToMany((type) => Users, (user) => user.blockedUsers)
  blockedUsersParents: Users[];

  @ManyToMany((type) => Users, (user) => user.blockedUsersParents)
  @JoinTable()
  blockedUsers: Users[];

  @Column({
    nullable: true,
    default: false,
  })
  isFriend: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  isOnline: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  isRequest: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  isBlocked: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  isPlaying: boolean;

  /** games */
  @Column({
    nullable: true,
    default: 0,
  })
  wins: number;

  @Column({
    nullable: true,
    default: 0,
  })
  losses: number;

  @Column({
    nullable: true,
    default: 0,
  })
  ratio: number;

  @Column({
    nullable: true,
    default: '100',
  })
  achievement: string;

  @Column({
    nullable: true,
    default: '',
  })
  roomId: string;

  /**
   * src/modules/games/game.entity.ts 참고
   * @see https://typeorm.io/many-to-many-relations
   */
  @ManyToMany(() => Games, (game) => game.players)
  games: Games[];

  @ManyToMany(() => DirectMessage, (directMessages) => directMessages.users)
  directMessages: DirectMessage[];

  @OneToMany(() => Channel, (channel) => channel.owner, {
    cascade: true,
  })
  ownedChannels: Channel[];

  @ManyToMany(() => Channel, (joinedChannels) => joinedChannels.users)
  joinedChannels: Channel[];

  @OneToMany(() => Punishment, (punishment) => punishment.punishedUser)
  receivedChannelPunishments: Punishment[];

  @OneToMany(() => Punishment, (punishment) => punishment.punishedByUser)
  givenChannelPunishments: Punishment[];

  /**
   * @see https://typeorm.io/decorator-reference#createdatecolumn
   * type: 'timestamp' -> WithPrecisionColumnType
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  /**
   * @see https://typeorm.io/decorator-reference#updatedatecolumn
   * type: 'timestamp' -> WithPrecisionColumnType
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;
}
