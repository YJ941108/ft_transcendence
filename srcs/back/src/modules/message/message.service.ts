import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  private logger: Logger = new Logger('Channel Messages Service');

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  findAll() {
    return this.messagesRepository.find({
      relations: ['author', 'channel'],
    });
  }

  async findOne(id: string) {
    const message = await this.messagesRepository.findOne(id, {
      relations: ['author', 'channel'],
    });

    if (!message) {
      throw new Error(`Message [${id}] not found`);
    }
    return message;
  }

  async create(createChanMessageDto: CreateMessageDto) {
    const message = this.messagesRepository.create(createChanMessageDto);

    await this.messagesRepository.save(message).catch(() => {
      throw new Error('Message may not be longer than 640 characters.');
    });
    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    const message = await this.messagesRepository.preload({
      id: +id,
      ...updateMessageDto,
    });

    if (!message) {
      throw new Error(`Cannot update Message [${id}]: Not found`);
    }
    return this.messagesRepository.save(message);
  }

  async remove(id: string) {
    const message = await this.findOne(id);

    if (!message) {
      throw new Error(`Message [${id}] not found`);
    }
    return this.messagesRepository.remove(message);
  }
}
