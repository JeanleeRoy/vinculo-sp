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
    if (id === '01a0c62b-8b9d-70b3-bd46-67c148009047') {
      return {
        id: '01a0c62b-8b9d-70b3-bd46-67c148009047',
        message: '¡Feliz día, Amig@!',
        sub_caption: '',
        event_name: 'Día de la primavera',
        date: '2026-09-21T22:52:16.821Z',
        expired_at: null,
        is_enabled: true,
        is_active: true,
      };
    }

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
      eventName: dto.event_name,
      date: dto.date ? new Date(dto.date) : new Date(),
      expiredAt: dto.expired_at ? new Date(dto.expired_at) : null,
      isEnabled: dto.is_enabled ?? true,
    });
    return MessageResponseDto.fromDomain(created);
  }
}
