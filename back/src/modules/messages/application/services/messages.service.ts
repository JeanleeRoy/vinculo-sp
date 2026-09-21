import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MESSAGE_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageResponseDto } from '../dto/message-response.dto';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly repository: IMessageRepository,
  ) {}

  async findAll(): Promise<MessageResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map((item) => MessageResponseDto.fromDomain(item));
  }

  async findActive(): Promise<MessageResponseDto[]> {
    const list = await this.repository.findActive();
    return list.map((item) => MessageResponseDto.fromDomain(item));
  }

  async findById(id: string): Promise<MessageResponseDto> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return MessageResponseDto.fromDomain(item);
  }

  async create(dto: CreateMessageDto): Promise<MessageResponseDto> {
    const created = await this.repository.create({
      message: dto.message,
      subCaption: dto.sub_caption,
      date: new Date(),
      expiredAt: dto.expired_at ? new Date(dto.expired_at) : null,
      isEnabled: dto.is_enabled ?? true,
    });
    return MessageResponseDto.fromDomain(created);
  }
}
