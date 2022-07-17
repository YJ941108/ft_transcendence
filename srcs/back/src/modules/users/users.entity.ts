// https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Games } from '../games/games.entity';

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

  /** OAuth 2.0 */

  @Column({
    nullable: true,
  })
  access_token: string;

  @Column({
    nullable: true,
  })
  refresh_token: string;

  /** JSON Web Token */

  @Column({
    nullable: true,
  })
  jwt: string;

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
  tfa_code: string;

  @Column({
    select: false,
    default: false,
  })
  has_tfa_been_validated: boolean;

  /** friends */
  @Column('int', {
    nullable: true,
    array: true,
  })
  friends_request: number[];

  @Column('int', {
    nullable: true,
    array: true,
  })
  friends: number[];

  @Column('int', {
    nullable: true,
    array: true,
  })
  friends_blocked: number[];

  /**
   * src/modules/games/games.entity.ts 참고
   * @see https://typeorm.io/many-to-many-relations
   */
  @ManyToMany(() => Games, (game) => game.players)
  games: Games[];

  /**
   * @see https://typeorm.io/decorator-reference#createdatecolumn
   * type: 'timestamp' -> WithPrecisionColumnType
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  /**
   * @see https://typeorm.io/decorator-reference#updatedatecolumn
   * type: 'timestamp' -> WithPrecisionColumnType
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
