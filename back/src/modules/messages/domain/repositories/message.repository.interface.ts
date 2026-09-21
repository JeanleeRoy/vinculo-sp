import { MessageDomainEntity } from '../entities/message.domain-entity';

export interface CreateMessageData {
  message: string;
  subCaption?: string | null;
  date?: Date;
  expiredAt?: Date | null;
  isEnabled?: boolean;
}

export interface IMessageRepository {
  findAll(): Promise<MessageDomainEntity[]>;
  findById(id: string): Promise<MessageDomainEntity | null>;
  findActive(): Promise<MessageDomainEntity[]>;
  create(data: CreateMessageData): Promise<MessageDomainEntity>;
}
