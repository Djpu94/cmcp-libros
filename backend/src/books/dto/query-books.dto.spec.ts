import { plainToInstance } from 'class-transformer';
import { QueryBooksDto } from './query-books.dto.js';

describe('QueryBooksDto', () => {
  it.each([
    ['true', true],
    ['false', false],
    ['other', 'other'],
  ])('transforms available=%s to %s', (available, expected) => {
    const query = plainToInstance(QueryBooksDto, { available });

    expect(query.available).toBe(expected);
  });

  it('provides default pagination and ordering values', () => {
    const query = plainToInstance(QueryBooksDto, {});

    expect(query).toMatchObject({
      sortBy: 'createdAt',
      order: 'desc',
      page: 1,
      limit: 10,
    });
  });

  it('converts pagination values from query strings to numbers', () => {
    const query = plainToInstance(QueryBooksDto, {
      page: '3',
      limit: '25',
    });

    expect(query).toMatchObject({ page: 3, limit: 25 });
  });
});
