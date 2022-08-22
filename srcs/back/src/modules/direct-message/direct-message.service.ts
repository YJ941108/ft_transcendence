import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { UpdateDirectMessageDto } from './dto/update-direct-message.dto';
import { DirectMessage } from './entities/direct-message.entity';

@Injectable()
export class DirectMessageService {
  private logger: Logger = new Logger('DirectMessages Service');

  constructor(
    @InjectRepository(DirectMessage)
    private readonly directMessagesRepository: Repository<DirectMessage>,
  ) {}

  findAll() {
    return this.directMessagesRepository.find({
      relations: ['users', 'messages', 'messages.author'],
    });
  }

  async findOne(id: number) {
    const directMessage = await this.directMessagesRepository.findOne(id, {
      relations: ['users', 'messages', 'messages.author'],
      order: {
        id: 'ASC',
      },
    });
    if (!directMessage) {
      throw new Error(`Direct Message [${id}] not found`);
    }
    return directMessage;
  }

  async create(createDirectMessageDto: CreateDirectMessageDto) {
    const directMessage = this.directMessagesRepository.create(createDirectMessageDto);

    this.logger.log('Create new Direct Message');
    return this.directMessagesRepository.save(directMessage);
  }

  async update(id: string, updateDirectMessageDto: UpdateDirectMessageDto) {
    const directMessage = await this.directMessagesRepository.preload({
      id: +id,
      ...updateDirectMessageDto,
    });
    if (!directMessage) {
      throw new Error(`Cannot update Direct Message [${id}]: Not found`);
    }
    this.logger.log(`Update Direct Message [${directMessage.id}]`);
    return this.directMessagesRepository.save(directMessage);
  }

  async remove(id: string) {
    const directMessage = await this.directMessagesRepository.findOne(id);

    if (!directMessage) {
      throw new Error(`Direct Message [${id}] not found`);
    }
    this.logger.log(`Remove Direct Message [${directMessage.id}]`);
    return this.directMessagesRepository.remove(directMessage);
  }
}
