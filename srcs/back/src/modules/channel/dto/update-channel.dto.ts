import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChannelDto } from './create-channel.dto';
import { Users } from 'src/modules/users/entities/users.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Punishment } from 'src/modules/punishment/entities/punishment.entity';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsOptional()
  @IsArray()
  @Type(() => Users)
  readonly admins?: Users[];

  @IsOptional()
  @IsArray()
  @Type(() => Message)
  readonly messages?: Message[];

  @IsOptional()
  @IsArray()
  @Type(() => Punishment)
  readonly punishments?: Punishment[];
}
