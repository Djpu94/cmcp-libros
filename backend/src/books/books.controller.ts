import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { pipeline } from 'node:stream/promises';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/current-user.decorator.js';
import {
  BOOK_COVER_MAX_BYTES,
  UPLOADS_URL_PREFIX,
  detectBookCoverExtension,
  saveBookCover,
} from './book-cover.js';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBooksDto } from './dto/query-books.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@ApiBearerAuth()
@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('export/csv')
  @ApiOperation({ summary: 'Export filtered books to CSV' })
  async exportCsv(
    @Query() query: QueryBooksDto,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.booksService.exportCsv(query);
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="books-${date}.csv"`,
    );
    await pipeline(csv, response);
  }

  @Get()
  @ApiOperation({ summary: 'List books with filtering and pagination' })
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Post('cover')
  @ApiOperation({ summary: 'Upload a PNG or JPEG cover image (max 5 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: BOOK_COVER_MAX_BYTES },
    }),
  )
  async uploadCover(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
  ): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen en el campo "file".');
    }

    const extension = detectBookCoverExtension(file.buffer);
    if (!extension) {
      throw new BadRequestException('Formato no válido. Sube una imagen PNG o JPG.');
    }

    const fileName = await saveBookCover(file.buffer, extension);
    return {
      imageUrl: `${request.protocol}://${request.get('host')}${UPLOADS_URL_PREFIX}/books/${fileName}`,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a book' })
  create(
    @Body() dto: CreateBookDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.booksService.create(dto, this.getUserId(user));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.booksService.update(id, dto, this.getUserId(user));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a book' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.booksService.remove(id, this.getUserId(user));
  }

  private getUserId(user: AuthenticatedUser | undefined): string {
    const userId = user?.id ?? user?.userId ?? user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }
}
