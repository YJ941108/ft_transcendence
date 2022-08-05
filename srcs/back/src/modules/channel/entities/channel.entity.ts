import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsOptional } from 'class-validator';
import { Users } from 'src/modules/users/entities/users.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Punishment } from 'src/modules/punishment/entities/punishment.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 방 이름
   */
  @Column({ unique: true })
  name: string;

  /**
   * 방 공개
   * public | private | protected
   */
  @Column({ default: 'private' })
  privacy: string;

  /**
   * 비밀번호
   */
  @IsOptional()
  @Column({ select: false, nullable: true })
  password: string;

  /**
   * Mute/ban duration in minutes: 1 | 5 | 15
   * NOTE: very short to test it easily
   */
  @Column({ default: 1 })
  restrictionDuration: number;

  /**
   * 방 소유자
   */
  @ManyToOne(() => Users, (owner) => owner.ownedChannels, {
    onDelete: 'CASCADE',
  })
  owner: Users;

  /**
   * 참가자
   */
  @ManyToMany(() => Users, (user) => user.joinedChannels)
  @JoinTable()
  users: Users[];

  /**
   * 관리자
   */
  @ManyToMany(() => Users)
  @JoinTable()
  admins: Users[];

  /**
   * 채팅 기록
   */
  @OneToMany(() => Message, (message) => message.channel, {
    cascade: true,
  })
  messages: Message[];

  /**
   * 추방
   */
  @OneToMany(() => Punishment, (punishment) => punishment.channel, {
    cascade: true,
  })
  punishments: Punishment[];

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
