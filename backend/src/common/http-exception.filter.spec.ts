import { Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('formats a NotFoundException with the standard response shape', () => {
    const filter = new HttpExceptionFilter();
    const json = vi.fn();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const response = {
      status: vi.fn().mockReturnThis(),
      json,
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', path: '/books/missing' }),
        getResponse: () => response,
      }),
    };

    filter.catch(new NotFoundException('Book not found'), host as never);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      timestamp: expect.any(String),
      path: '/books/missing',
      message: 'Book not found',
      error: 'Not Found',
    });
  });

  it.each([
    ['P2002', 409, 'Conflict'],
    ['P2025', 404, 'Not Found'],
  ])('maps Prisma %s to HTTP %i', (code, statusCode, error) => {
    const filter = new HttpExceptionFilter();
    const json = vi.fn();
    const response = {
      status: vi.fn().mockReturnThis(),
      json,
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'PATCH', path: '/books/1' }),
        getResponse: () => response,
      }),
    };
    const exception = new Prisma.PrismaClientKnownRequestError('database detail', {
      code,
      clientVersion: 'test',
    });

    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    filter.catch(exception, host as never);

    expect(response.status).toHaveBeenCalledWith(statusCode);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode, error }),
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain('database detail');
  });

  it('does not log or return stack traces in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const filter = new HttpExceptionFilter();
    const json = vi.fn();
    const response = {
      status: vi.fn().mockReturnThis(),
      json,
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          path: '/broken',
          user: { id: 'user-1' },
        }),
        getResponse: () => response,
      }),
    };
    const logError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    filter.catch(new Error('internal detail'), host as never);

    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      timestamp: expect.any(String),
      path: '/broken',
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
    expect(logError.mock.calls[0]?.[0]).toContain('"userId":"user-1"');
    expect(logError.mock.calls[0]?.[0]).not.toContain('stack');
    expect(JSON.stringify(json.mock.calls)).not.toContain('internal detail');
  });
});
