import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Length,
} from 'class-validator';
import { PasswordValidator } from 'src/utils/patternValidator';
import { Transform, Type } from 'class-transformer';
import { Users } from 'src/modules/users/entity/users.entity';

export class CreateChannelDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Matches(/^[a-zA-Z0-9_ ]+$/, {
    message: 'The channel name must contain alphanumeric characters, underscores and spaces only.',
  })
  @Length(3, 20)
  readonly name: string;

  @IsString()
  @IsIn(['public', 'private', 'protected'])
  readonly privacy: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @PasswordValidator()
  password?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 5, 15])
  readonly restrictionDuration?: number;

  @IsNotEmpty()
  readonly owner: Users;

  @IsNotEmpty()
  @IsArray()
  @Type(() => Users)
  @ArrayMinSize(1)
  readonly users: Users[];
}
