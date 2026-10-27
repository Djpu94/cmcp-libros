import type { Prisma } from '@prisma/client';

export const BOOKS_REPOSITORY = Symbol('BOOKS_REPOSITORY');

export type BookListArgs = Omit<Prisma.BookFindManyArgs, 'select'>;
export type BookListItem = Prisma.BookGetPayload<{
  select: {
    id: true;
    title: true;
    author: true;
    publisher: true;
    price: true;
    available: true;
    genre: true;
    imageUrl: true;
  };
}>;

export interface IBooksRepository {
  findMany(args: BookListArgs): Promise<BookListItem[]>;
  count(where: Prisma.BookWhereInput): Promise<number>;
  findById(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.BookGetPayload<object> | null>;
  create(
    data: Prisma.BookCreateInput,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.BookGetPayload<object>>;
  update(
    id: string,
    data: Prisma.BookUpdateInput,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.BookGetPayload<object>>;
  softDelete(
    id: string,
    userId: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.BookGetPayload<object>>;
  createAuditLog(
    data: Prisma.AuditLogCreateInput,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.AuditLogGetPayload<object>>;
}
