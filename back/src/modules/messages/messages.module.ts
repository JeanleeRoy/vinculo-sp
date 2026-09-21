import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageOrmEntity } from './infrastructure/persistence/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/typeorm-message.repository';
import { MESSAGE_REPOSITORY_TOKEN } from './infrastructure/tokens';
import { MessagesService } from './application/services/messages.service';
import { MessagesController } from './presentation/controllers/messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageOrmEntity])],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: TypeOrmMessageRepository,
    },
  ],
  exports: [MessagesService, MESSAGE_REPOSITORY_TOKEN],
})
export class MessagesModule {}
