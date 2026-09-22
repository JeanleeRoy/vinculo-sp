export class MessageDomainEntity {
  id: string;
  message: string;
  subCaption: string | null;
  eventName: string | null;
  date: Date;
  expiredAt: Date | null;
  isEnabled: boolean;

  constructor(partial: Partial<MessageDomainEntity>) {
    Object.assign(this, partial);
  }

  isExpired(): boolean {
    if (!this.expiredAt) {
      return false;
    }
    return new Date() > this.expiredAt;
  }

  isActive(): boolean {
    return this.isEnabled && !this.isExpired();
  }
}
