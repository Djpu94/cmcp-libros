import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BOOK_GENRES } from '../books.genres.js';

const BOOK_SORT_FIELDS = ['title', 'author', 'price', 'createdAt'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

export class QueryBooksDto {
  @ApiProperty({ required: false, example: 'tolkien' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: BOOK_GENRES })
  @IsOptional()
  @IsString()
  @IsIn(BOOK_GENRES)
  genre?: (typeof BOOK_GENRES)[number];

  @ApiProperty({ required: false, example: 'George Allen & Unwin' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({ required: false, example: 'J. R. R. Tolkien' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ enum: BOOK_SORT_FIELDS, default: 'createdAt' })
  @IsIn(BOOK_SORT_FIELDS)
  sortBy: (typeof BOOK_SORT_FIELDS)[number] = 'createdAt';

  @ApiProperty({ enum: SORT_ORDERS, default: 'desc' })
  @IsIn(SORT_ORDERS)
  order: (typeof SORT_ORDERS)[number] = 'desc';

  @ApiProperty({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
