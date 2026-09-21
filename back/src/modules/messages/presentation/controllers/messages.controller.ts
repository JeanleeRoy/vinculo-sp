import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from '../../application/services/messages.service';
import { CreateMessageDto } from '../../application/dto/create-message.dto';
import { MessageResponseDto } from '../../application/dto/message-response.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(): Promise<MessageResponseDto[]> {
    return this.messagesService.findAll();
  }

  @Get('active')
  async findActive(): Promise<MessageResponseDto[]> {
    return this.messagesService.findActive();
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<MessageResponseDto> {
    return this.messagesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMessageDto): Promise<MessageResponseDto> {
    return this.messagesService.create(dto);
  }
}
