import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { stringify } from 'csv-stringify';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { BooksService } from '../src/books/books.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Books HTTP endpoints', () => {
  let app: INestApplication;
  const booksService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    exportCsv: vi.fn(),
  };

  beforeEach(async () => {
    vi.stubEnv('JWT_SECRET', 'test-secret-with-sufficient-length');
    vi.clearAllMocks();

    booksService.findAll.mockResolvedValue({
      data: [
        {
          id: 'book-1',
          title: 'The Hobbit',
          author: 'J. R. R. Tolkien',
          publisher: 'Allen & Unwin',
          price: '19.99',
          available: false,
          genre: 'Fantasy',
          imageUrl: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 1,
      totalPages: 1,
    });
    booksService.exportCsv.mockImplementation(async () => {
      const csv = stringify({
        header: true,
        columns: ['id', 'title', 'author'],
      });
      csv.write({
        id: 'book-1',
        title: 'The Hobbit, There and Back Again',
        author: 'J. R. R. Tolkien',
      });
      csv.end();
      return csv;
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(BooksService)
      .useValue(booksService)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  it('requires authentication and returns a paginated list for authenticated requests', async () => {
    await request(app.getHttpServer()).get('/books').expect(401);

    const token = app.get(JwtService).sign({
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    });
    const response = await request(app.getHttpServer())
      .get('/books?available=false&limit=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        data: [expect.objectContaining({ id: 'book-1' })],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      }),
    );
    expect(response.body.data.data[0]).not.toHaveProperty('deletedAt');
    expect(response.body.data.data[0]).not.toHaveProperty('updatedById');
    expect(booksService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ available: false, limit: 1 }),
    );
  });

  it('streams filtered CSV with the attachment headers', async () => {
    const token = app.get(JwtService).sign({
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    });
    const response = await request(app.getHttpServer())
      .get('/books/export/csv?genre=Fantasy')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.headers['content-type']).toMatch(/^text\/csv/);
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename="books-\d{8}\.csv"$/,
    );
    expect(response.text).toContain('"The Hobbit, There and Back Again"');
    expect(booksService.exportCsv).toHaveBeenCalledWith(
      expect.objectContaining({ genre: 'Fantasy' }),
    );
  });
});
