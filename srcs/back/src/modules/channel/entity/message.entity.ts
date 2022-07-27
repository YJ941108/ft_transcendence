import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { DirectMessage } from 'src/modules/direct-message/entity/direct-message.entity';
import { Users } from 'src/modules/users/entity/users.entity';

/**
 * DM과 Channel모두 같은 message 엔티티를 공유합니다.
 */
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 채널이 삭제되면 메시지도 삭제됨
   */
  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @ManyToOne(() => DirectMessage, (directMessage) => directMessage.messages, {
    onDelete: 'CASCADE',
  })
  directMessage: DirectMessage;

  @ManyToOne(() => Users)
  author: Users;

  @Column({ length: 640 })
  content: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
