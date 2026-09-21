import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import {
  CreateMessageData,
  IMessageRepository,
} from '../../domain/repositories/message.repository.interface';
import { MessageDomainEntity } from '../../domain/entities/message.domain-entity';
import { MessageOrmEntity } from './message.orm-entity';

@Injectable()
export class TypeOrmMessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repository: Repository<MessageOrmEntity>,
  ) {}

  async findAll(): Promise<MessageDomainEntity[]> {
    const records = await this.repository.find({
      order: { date: 'DESC' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<MessageDomainEntity | null> {
    const record = await this.repository.findOne({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findActive(): Promise<MessageDomainEntity[]> {
    const now = new Date();
    const records = await this.repository.find({
      where: [
        { is_enabled: true, expired_at: IsNull() },
        { is_enabled: true, expired_at: MoreThan(now) },
      ],
      order: { date: 'DESC' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(data: CreateMessageData): Promise<MessageDomainEntity> {
    const entity = this.repository.create({
      message: data.message,
      sub_caption: data.subCaption ?? null,
      date: data.date ?? new Date(),
      expired_at: data.expiredAt ?? null,
      is_enabled: data.isEnabled ?? true,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(orm: MessageOrmEntity): MessageDomainEntity {
    return new MessageDomainEntity({
      id: orm.id,
      message: orm.message,
      subCaption: orm.sub_caption,
      date: orm.date,
      expiredAt: orm.expired_at,
      isEnabled: orm.is_enabled,
    });
  }
}
