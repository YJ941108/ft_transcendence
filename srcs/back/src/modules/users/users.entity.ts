/**
 * @see https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts
 */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Game } from '../games/games.entity';

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
  accessToken: string;

  @Column({
    nullable: true,
  })
  refreshToken: string;

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
  tfaCode: string;

  /** friends */
  @ManyToMany((type) => Users)
  @JoinTable({ joinColumn: { name: 'users_id_1' } })
  friendsRequest: Users[];

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

  /** games */
  @Column({
    nullable: true,
  })
  wins: number;

  @Column({
    nullable: true,
  })
  losses: number;

  @Column({
    nullable: true,
  })
  ratio: number;

  /**
   * src/modules/games/game.entity.ts 참고
   * @see https://typeorm.io/many-to-many-relations
   */
  @ManyToMany(() => Game, (game) => game.players)
  game: Game[];

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
