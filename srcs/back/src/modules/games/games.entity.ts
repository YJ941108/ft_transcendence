/**
 * @link https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts
 */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../users/entities/users.entity';

/**
 *
 */
@Entity()
export class Games extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Users, (user) => user.games)
  @JoinTable()
  players: Users[];

  @Column({
    nullable: true,
  })
  winnerId: number;

  @Column({
    nullable: true,
  })
  loserId: number;

  @Column({
    nullable: true,
  })
  winnerScore: number;

  @Column({
    nullable: true,
  })
  loserScore: number;

  @Column({
    nullable: true,
  })
  mode: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;
}
