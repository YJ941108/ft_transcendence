import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { DirectMessage } from 'src/modules/direct-message/entities/direct-message.entity';
import { Channel } from 'src/modules/channel/entities/channel.entity';
import { Users } from 'src/modules/users/entities/users.entity';

export class CreateMessageDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 640, {
    message: 'Empty messages are not allowed.',
  })
  readonly content: string;

  @IsNotEmpty()
  readonly DM?: DirectMessage;

  @IsNotEmpty()
  readonly channel?: Channel;

  @IsNotEmpty()
  readonly author?: Users;

  @IsOptional()
  @IsString()
  @IsIn(['text', 'invite'])
  type?: string;

  @IsOptional()
  @IsString()
  roomId?: string;
}
