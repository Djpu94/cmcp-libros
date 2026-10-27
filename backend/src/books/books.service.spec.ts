import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service.js';
import { BooksService } from './books.service.js';
import { QueryBooksDto } from './dto/query-books.dto.js';
import type { IBooksRepository } from './books.repository.js';

describe('BooksService', () => {
  const transaction = {} as unknown as Prisma.TransactionClient;
  const book = {
    id: 'book-1',
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    publisher: 'Allen & Unwin',
    price: new Prisma.Decimal(19.99),
    available: true,
    genre: 'Fantasy',
    imageUrl: null,
    deletedAt: null,
    updatedById: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const repository = {
    findMany: vi.fn(),
    count: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    createAuditLog: vi.fn(),
  };
  const prisma = {
    $transaction: vi.fn(
      async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
        callback(transaction),
    ),
  };
  const service = new BooksService(
    repository as unknown as IBooksRepository,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('combines filters, excludes deleted records, and paginates selected results', async () => {
    repository.findMany.mockResolvedValue([book]);
    repository.count.mockResolvedValue(1);
    const query = Object.assign(new QueryBooksDto(), {
      search: 'hobbit',
      genre: 'Fantasy',
      publisher: 'Allen',
      author: 'Tolkien',
      available: false,
      sortBy: 'price',
      order: 'asc',
      page: 2,
      limit: 5,
    });

    await expect(service.findAll(query)).resolves.toEqual({
      data: [book],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    });

    expect(repository.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        AND: [
          {
            OR: [
              { title: { contains: 'hobbit', mode: 'insensitive' } },
              { author: { contains: 'hobbit', mode: 'insensitive' } },
            ],
          },
          { genre: 'Fantasy' },
          { publisher: { contains: 'Allen', mode: 'insensitive' } },
          { author: { contains: 'Tolkien', mode: 'insensitive' } },
          { available: false },
        ],
      },
      orderBy: { price: 'asc' },
      skip: 5,
      take: 5,
    });
    expect(repository.count).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null }),
    );
  });

  it('omits pagination while exporting the matching filtered dataset to CSV', async () => {
    repository.findMany.mockResolvedValue([
      { ...book, title: 'The Hobbit, There and Back Again' },
    ]);
    repository.count.mockResolvedValue(1);

    const stream = await service.exportCsv(
      Object.assign(new QueryBooksDto(), { author: 'Tolkien' }),
    );
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }

    expect(chunks.join('')).toContain(
      '"The Hobbit, There and Back Again"',
    );
    expect(repository.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({ skip: expect.anything(), take: expect.anything() }),
    );
    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          AND: [{ author: { contains: 'Tolkien', mode: 'insensitive' } }],
        }),
      }),
    );
  });

  it('creates a book and its audit record in the same transaction', async () => {
    repository.create.mockResolvedValue(book);
    repository.createAuditLog.mockResolvedValue({});

    await service.create(
      {
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        price: 19.99,
        genre: 'Fantasy',
      },
      'user-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: book.title }),
      transaction,
    );
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entity: 'Book',
        entityId: book.id,
        user: { connect: { id: 'user-1' } },
      }),
      transaction,
    );
  });

  it('updates the book and its audit record in the same transaction', async () => {
    repository.findById.mockResolvedValue(book);
    repository.update.mockResolvedValue({ ...book, title: 'Updated title' });
    repository.createAuditLog.mockResolvedValue({});

    await service.update(book.id, { title: 'Updated title' }, 'user-1');

    expect(repository.update).toHaveBeenCalledWith(
      book.id,
      {
        updatedBy: { connect: { id: 'user-1' } },
        title: 'Updated title',
      },
      transaction,
    );
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        entity: 'Book',
        entityId: book.id,
      }),
      transaction,
    );
  });

  it('soft-deletes the book and audits the operation transactionally', async () => {
    repository.findById.mockResolvedValue(book);
    repository.softDelete.mockResolvedValue({
      ...book,
      deletedAt: new Date(),
      updatedById: 'user-1',
    });
    repository.createAuditLog.mockResolvedValue({});

    await service.remove(book.id, 'user-1');

    expect(repository.softDelete).toHaveBeenCalledWith(
      book.id,
      'user-1',
      transaction,
    );
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SOFT_DELETE',
        entity: 'Book',
        entityId: book.id,
      }),
      transaction,
    );
  });

  it('does not return a soft-deleted book', async () => {
    repository.findById.mockResolvedValue({ ...book, deletedAt: new Date() });

    await expect(service.findOne(book.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
