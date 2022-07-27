import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Users } from 'src/modules/users/entity/users.entity';

export class CreateDirectMessageDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => Users)
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  readonly users: Users[];
}
