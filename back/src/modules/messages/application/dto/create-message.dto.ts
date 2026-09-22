import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sub_caption?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  expired_at?: string;

  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;
}
