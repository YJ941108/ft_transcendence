import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from 'src/modules/users/entities/users.entity';
import { Channel } from 'src/modules/channel/entities/channel.entity';

export type PunishmentType = 'mute' | 'ban';

@Entity()
export class Punishment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.punishments, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @ManyToOne(() => Users, (user) => user.receivedChannelPunishments)
  punishedUser: Users;

  @ManyToOne(() => Users, (user) => user.givenChannelPunishments)
  punishedByUser: Users;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  startsAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt: Date;

  @Column({ unsigned: true, nullable: true })
  durationInSeconds: number;

  @Column({ default: 'ban' })
  type: PunishmentType;

  @Column({ length: 1000, nullable: true })
  reason: string;
}
