import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectMessageDto } from './create-direct-message.dto';
import { Message } from 'src/modules/message/entities/message.entity';

export class UpdateDirectMessageDto extends PartialType(CreateDirectMessageDto) {
  @IsOptional()
  @IsArray()
  @Type(() => Message)
  readonly messages: Message[];
}
