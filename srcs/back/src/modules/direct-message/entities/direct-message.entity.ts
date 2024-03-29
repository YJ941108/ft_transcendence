import { Message } from 'src/modules/message/entities/message.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Users, (user) => user.directMessages)
  @JoinTable()
  users: Users[];

  @OneToMany(() => Message, (message) => message.DM, {
    cascade: true,
  })
  messages: Message[];

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
