import { MessageDomainEntity } from '../../domain/entities/message.domain-entity';

export class MessageResponseDto {
  id: string;
  message: string;
  sub_caption: string | null;
  date: string;
  expired_at: string | null;
  is_enabled: boolean;
  is_active: boolean;

  static fromDomain(entity: MessageDomainEntity): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.id = entity.id;
    dto.message = entity.message;
    dto.sub_caption = entity.subCaption;
    dto.date = entity.date.toISOString();
    dto.expired_at = entity.expiredAt ? entity.expiredAt.toISOString() : null;
    dto.is_enabled = entity.isEnabled;
    dto.is_active = entity.isActive();
    return dto;
  }
}
