// https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts

import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity()
@Unique(['email'])
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  username: string;

  @Column({
    nullable: false,
  })
  email: string;

  @Column({
    nullable: true,
  })
  nickname: string;

  @Column({
    nullable: true,
  })
  photo: string;

  @Column('int', {
    nullable: true,
    array: true,
  })
  friendsRequest: number[];

  @Column('int', {
    nullable: true,
    array: true,
  })
  friends: number[];

  @Column('int', {
    nullable: true,
    array: true,
  })
  friendsBlocked: number[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
