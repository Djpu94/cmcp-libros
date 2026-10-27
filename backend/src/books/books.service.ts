import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { stringify } from 'csv-stringify';
import type { CreateBookDto } from './dto/create-book.dto.js';
import type { QueryBooksDto } from './dto/query-books.dto.js';
import type { UpdateBookDto } from './dto/update-book.dto.js';
import { BOOKS_REPOSITORY } from './books.repository.js';
import type { BookListItem, IBooksRepository } from './books.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PaginatedBooks {
  data: BookListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BooksService {
  constructor(
    @Inject(BOOKS_REPOSITORY)
    private readonly booksRepository: IBooksRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    query: QueryBooksDto,
    paginate = true,
  ): Promise<PaginatedBooks> {
    const filters: Prisma.BookWhereInput[] = [];

    if (query.search) {
      filters.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { author: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }
    if (query.genre) {
      filters.push({ genre: query.genre });
    }
    if (query.publisher) {
      filters.push({
        publisher: { contains: query.publisher, mode: 'insensitive' },
      });
    }
    if (query.author) {
      filters.push({ author: { contains: query.author, mode: 'insensitive' } });
    }
    if (query.available !== undefined) {
      filters.push({ available: query.available });
    }

    const where: Prisma.BookWhereInput = {
      deletedAt: null,
      AND: filters,
    };
    const page = query.page;
    const limit = query.limit;
    const [data, total] = await Promise.all([
      this.booksRepository.findMany({
        where,
        orderBy: { [query.sortBy]: query.order },
        ...(paginate ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      this.booksRepository.count(where),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const book = await this.booksRepository.findById(id);
    if (!book || book.deletedAt !== null) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    return book;
  }

  async create(dto: CreateBookDto, userId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const book = await this.booksRepository.create(
        {
          title: dto.title,
          author: dto.author,
          publisher: dto.publisher,
          price: dto.price,
          ...(dto.available === undefined ? {} : { available: dto.available }),
          genre: dto.genre,
          ...(dto.imageUrl === undefined ? {} : { imageUrl: dto.imageUrl }),
        },
        transaction,
      );
      await this.booksRepository.createAuditLog(
        {
          action: 'CREATE',
          entity: 'Book',
          entityId: book.id,
          user: { connect: { id: userId } },
        },
        transaction,
      );

      return book;
    });
  }

  async update(id: string, dto: UpdateBookDto, userId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await this.booksRepository.findById(id, transaction);
      if (!current || current.deletedAt !== null) {
        throw new NotFoundException(`Book with id "${id}" not found`);
      }

      const book = await this.booksRepository.update(
        id,
        {
          updatedBy: { connect: { id: userId } },
          ...(dto.title === undefined ? {} : { title: dto.title }),
          ...(dto.author === undefined ? {} : { author: dto.author }),
          ...(dto.publisher === undefined ? {} : { publisher: dto.publisher }),
          ...(dto.price === undefined ? {} : { price: dto.price }),
          ...(dto.available === undefined ? {} : { available: dto.available }),
          ...(dto.genre === undefined ? {} : { genre: dto.genre }),
          ...(dto.imageUrl === undefined ? {} : { imageUrl: dto.imageUrl }),
        },
        transaction,
      );
      await this.booksRepository.createAuditLog(
        {
          action: 'UPDATE',
          entity: 'Book',
          entityId: id,
          user: { connect: { id: userId } },
        },
        transaction,
      );

      return book;
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await this.booksRepository.findById(id, transaction);
      if (!current || current.deletedAt !== null) {
        throw new NotFoundException(`Book with id "${id}" not found`);
      }

      const book = await this.booksRepository.softDelete(
        id,
        userId,
        transaction,
      );
      await this.booksRepository.createAuditLog(
        {
          action: 'SOFT_DELETE',
          entity: 'Book',
          entityId: id,
          user: { connect: { id: userId } },
        },
        transaction,
      );

      return book;
    });
  }

  async exportCsv(query: QueryBooksDto) {
    const { data } = await this.findAll(query, false);
    const csv = stringify({
      header: true,
      columns: [
        'id',
        'title',
        'author',
        'publisher',
        'price',
        'available',
        'genre',
        'imageUrl',
      ],
    });

    for (const book of data) {
      csv.write(book);
    }
    csv.end();

    return csv;
  }
}
