import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BooksController } from './books.controller.js';
import { BOOKS_REPOSITORY } from './books.repository.js';
import { BooksService } from './books.service.js';
import { PrismaBooksRepository } from './prisma-books.repository.js';

export { BOOKS_REPOSITORY } from './books.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [BooksController],
  providers: [
    BooksService,
    PrismaBooksRepository,
    { provide: BOOKS_REPOSITORY, useExisting: PrismaBooksRepository },
  ],
})
export class BooksModule {}
