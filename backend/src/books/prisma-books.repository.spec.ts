import { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaBooksRepository } from './prisma-books.repository.js';

describe('PrismaBooksRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists books with the repository selection', async () => {
    const args = { where: { deletedAt: null } };
    const prisma = {
      book: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const instance = new PrismaBooksRepository(prisma as unknown as PrismaService);

    await expect(instance.findMany(args)).resolves.toEqual([]);
    expect(prisma.book.findMany).toHaveBeenCalledWith({
      ...args,
      select: {
        id: true,
        title: true,
        author: true,
        publisher: true,
        price: true,
        available: true,
        genre: true,
        imageUrl: true,
      },
    });
  });

  it('counts books using the supplied filter', async () => {
    const where = { deletedAt: null };
    const prisma = { book: { count: vi.fn().mockResolvedValue(2) } };
    const instance = new PrismaBooksRepository(prisma as unknown as PrismaService);

    await expect(instance.count(where)).resolves.toBe(2);
    expect(prisma.book.count).toHaveBeenCalledWith({ where });
  });

  it('uses the transaction for book lookup when provided', async () => {
    const tx = {
      book: { findUnique: vi.fn().mockResolvedValue({ id: 'book-1' }) },
    };
    const instance = new PrismaBooksRepository({} as PrismaService);

    await instance.findById('book-1', tx as unknown as Prisma.TransactionClient);

    expect(tx.book.findUnique).toHaveBeenCalledWith({
      where: { id: 'book-1' },
    });
  });

  it('uses the transaction when creating a book', async () => {
    const data = { title: 'The Hobbit' };
    const tx = { book: { create: vi.fn().mockResolvedValue({ id: 'book-1' }) } };
    const instance = new PrismaBooksRepository({} as PrismaService);

    await instance.create(data, tx as unknown as Prisma.TransactionClient);

    expect(tx.book.create).toHaveBeenCalledWith({ data });
  });

  it('uses the transaction when updating a book', async () => {
    const data = { title: 'Updated title' };
    const tx = { book: { update: vi.fn().mockResolvedValue({ id: 'book-1' }) } };
    const instance = new PrismaBooksRepository({} as PrismaService);

    await instance.update(
      'book-1',
      data,
      tx as unknown as Prisma.TransactionClient,
    );

    expect(tx.book.update).toHaveBeenCalledWith({
      where: { id: 'book-1' },
      data,
    });
  });

  it('soft-deletes by setting deletedAt and never physically deleting the book', async () => {
    const tx = {
      book: {
        update: vi.fn().mockResolvedValue({ id: 'book-1' }),
        delete: vi.fn(),
      },
    };
    const instance = new PrismaBooksRepository({} as PrismaService);

    await instance.softDelete(
      'book-1',
      'user-1',
      tx as unknown as Prisma.TransactionClient,
    );

    expect(tx.book.update).toHaveBeenCalledWith({
      where: { id: 'book-1' },
      data: {
        deletedAt: expect.any(Date),
        updatedBy: { connect: { id: 'user-1' } },
      },
    });
    expect(tx.book.delete).not.toHaveBeenCalled();
  });

  it('writes an audit record through the transaction', async () => {
    const data = { action: 'CREATE' };
    const tx = { auditLog: { create: vi.fn().mockResolvedValue({ id: 'log-1' }) } };
    const instance = new PrismaBooksRepository({} as PrismaService);

    await instance.createAuditLog(
      data,
      tx as unknown as Prisma.TransactionClient,
    );

    expect(tx.auditLog.create).toHaveBeenCalledWith({ data });
  });

  it('uses the root Prisma client when no transaction is supplied', async () => {
    const prisma = {
      book: {
        findUnique: vi.fn().mockResolvedValue({ id: 'book-1' }),
        create: vi.fn().mockResolvedValue({ id: 'book-1' }),
        update: vi.fn().mockResolvedValue({ id: 'book-1' }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'log-1' }) },
    };
    const instance = new PrismaBooksRepository(
      prisma as unknown as PrismaService,
    );

    await instance.findById('book-1');
    await instance.create({ title: 'The Hobbit' });
    await instance.update('book-1', { title: 'Updated title' });
    await instance.softDelete('book-1', 'user-1');
    await instance.createAuditLog({ action: 'CREATE' });

    expect(prisma.book.findUnique).toHaveBeenCalledWith({
      where: { id: 'book-1' },
    });
    expect(prisma.book.create).toHaveBeenCalledWith({
      data: { title: 'The Hobbit' },
    });
    expect(prisma.book.update).toHaveBeenCalledTimes(2);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: { action: 'CREATE' },
    });
  });
});
