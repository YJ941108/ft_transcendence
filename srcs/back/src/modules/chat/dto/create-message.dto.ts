import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { Users } from 'src/modules/users/entity/users.entity';
import { DirectMessage } from '../entity/direct-message.entity';
import { Channel } from '../entity/channel.entity';

export class CreateMessageDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 640, {
    message: 'Empty messages are not allowed.',
  })
  readonly content: string;

  @IsNotEmpty()
  readonly directMessage?: DirectMessage;

  @IsNotEmpty()
  readonly channel?: Channel;

  @IsNotEmpty()
  readonly author?: Users;

  @IsOptional()
  @IsString()
  @IsIn(['regular', 'invite'])
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly roomId?: string;
}
