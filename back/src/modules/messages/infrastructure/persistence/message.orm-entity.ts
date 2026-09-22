import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity({ name: 't_vinculo_message' })
export class MessageOrmEntity {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'sub_caption', type: 'text', nullable: true })
  sub_caption: string | null;

  @Column({ name: 'date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ name: 'expired_at', type: 'timestamptz', nullable: true })
  expired_at: Date | null;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  is_enabled: boolean;

  @BeforeInsert()
  generateDefaults(): void {
    if (!this.id) {
      this.id = uuidv7();
    }
    if (!this.date) {
      this.date = new Date();
    }
  }
}
