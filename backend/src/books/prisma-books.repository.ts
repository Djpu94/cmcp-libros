import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { BookListArgs, IBooksRepository } from './books.repository.js';

const BOOK_LIST_SELECT = {
  id: true,
  title: true,
  author: true,
  publisher: true,
  price: true,
  available: true,
  genre: true,
  imageUrl: true,
} satisfies Prisma.BookSelect;

@Injectable()
export class PrismaBooksRepository implements IBooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: BookListArgs) {
    return this.prisma.book.findMany({
      ...args,
      select: BOOK_LIST_SELECT,
    });
  }

  count(where: Prisma.BookWhereInput) {
    return this.prisma.book.count({ where });
  }

  findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? this.prisma).book.findUnique({ where: { id } });
  }

  create(data: Prisma.BookCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? this.prisma).book.create({ data });
  }

  update(
    id: string,
    data: Prisma.BookUpdateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    return (transaction ?? this.prisma).book.update({
      where: { id },
      data,
    });
  }

  softDelete(
    id: string,
    userId: string,
    transaction?: Prisma.TransactionClient,
  ) {
    return (transaction ?? this.prisma).book.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: { connect: { id: userId } },
      },
    });
  }

  createAuditLog(
    data: Prisma.AuditLogCreateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    return (transaction ?? this.prisma).auditLog.create({ data });
  }
}
