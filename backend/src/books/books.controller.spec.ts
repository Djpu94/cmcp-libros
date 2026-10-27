import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { Readable, Writable } from 'node:stream';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBooksDto } from './dto/query-books.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

describe('BooksController', () => {
  const booksService = {
    exportCsv: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const controller = new BooksController(
    booksService as unknown as BooksService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates book listing with the validated query DTO', async () => {
    const query = Object.assign(new QueryBooksDto(), {
      genre: 'Fantasy',
      search: 'hobbit',
    });
    booksService.findAll.mockResolvedValue({ data: [], total: 0 });

    await expect(controller.findAll(query)).resolves.toEqual({
      data: [],
      total: 0,
    });

    expect(booksService.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates book lookup by id', async () => {
    booksService.findOne.mockResolvedValue({ id: 'book-1' });

    await expect(controller.findOne('book-1')).resolves.toEqual({
      id: 'book-1',
    });

    expect(booksService.findOne).toHaveBeenCalledWith('book-1');
  });

  it('delegates book creation with the current user id', async () => {
    const dto = new CreateBookDto();
    const user = { id: 'user-1' };
    booksService.create.mockResolvedValue({ id: 'book-1' });

    await controller.create(dto, user);

    expect(booksService.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('delegates book updates with the current user id', async () => {
    const dto = new UpdateBookDto();
    const user = { id: 'user-1' };
    booksService.update.mockResolvedValue({ id: 'book-1' });

    await controller.update('book-1', dto, user);

    expect(booksService.update).toHaveBeenCalledWith(
      'book-1',
      dto,
      'user-1',
    );
  });

  it('streams CSV export and sets download headers', async () => {
    const query = new QueryBooksDto();
    let output = '';
    const headers = new Map<string, string>();
    const response = Object.assign(
      new Writable({
        write(chunk, _encoding, callback) {
          output += chunk.toString();
          callback();
        },
      }),
      {
        setHeader: vi.fn((name: string, value: string) => {
          headers.set(name, value);
        }),
      },
    );
    booksService.exportCsv.mockResolvedValue(
      Readable.from(['id,title\nbook-1,The Hobbit\n']),
    );

    await controller.exportCsv(query, response as unknown as Response);

    expect(booksService.exportCsv).toHaveBeenCalledWith(query);
    expect(headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="books-\d{8}\.csv"$/,
    );
    expect(output).toContain('book-1,The Hobbit');
  });

  it('passes the current user id to book removal', async () => {
    booksService.remove.mockResolvedValue({ id: 'book-1' });

    await expect(
      controller.remove('book-1', { id: 'user-1' }),
    ).resolves.toEqual({ id: 'book-1' });

    expect(booksService.remove).toHaveBeenCalledWith('book-1', 'user-1');
  });

  it.each([
    [{ userId: 'user-2' }, 'user-2'],
    [{ sub: 'user-3' }, 'user-3'],
  ])('supports the authenticated user identifier %o', async (user, userId) => {
    await controller.remove('book-1', user);

    expect(booksService.remove).toHaveBeenCalledWith('book-1', userId);
  });

  it('rejects book removal without an authenticated user id', () => {
    expect(() => controller.remove('book-1', undefined)).toThrow(
      UnauthorizedException,
    );
    expect(booksService.remove).not.toHaveBeenCalled();
  });
});
