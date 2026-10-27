import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { BOOK_GENRES } from '../books.genres.js';

export class CreateBookDto {
  @ApiProperty({ example: 'The Hobbit' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'J. R. R. Tolkien' })
  @IsString()
  author!: string;

  @ApiProperty({ example: 'George Allen & Unwin' })
  @IsString()
  publisher!: string;

  @ApiProperty({ example: 19.99, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  price!: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ enum: BOOK_GENRES, example: 'Fantasy' })
  @IsString()
  @IsIn(BOOK_GENRES)
  genre!: (typeof BOOK_GENRES)[number];

  @ApiProperty({ required: false, example: 'https://example.com/book.jpg' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
