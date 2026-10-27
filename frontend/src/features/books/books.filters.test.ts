import { describe, expect, it } from 'vitest'
import { DEFAULT_BOOK_FILTERS, parseBookFilters, serializeBookFilters } from './books.filters'

describe('parseBookFilters', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseBookFilters(new URLSearchParams(''))).toEqual(DEFAULT_BOOK_FILTERS)
  })

  it('reads every supported filter from the URL', () => {
    const filters = parseBookFilters(
      new URLSearchParams(
        'search=hobbit&genre=Fantasy&publisher=Minotauro&author=Tolkien&available=false&sortBy=price&order=asc&page=4',
      ),
    )

    expect(filters).toEqual({
      search: 'hobbit',
      genre: 'Fantasy',
      publisher: 'Minotauro',
      author: 'Tolkien',
      available: false,
      sortBy: 'price',
      order: 'asc',
      page: 4,
    })
  })

  it('ignores invalid enum values and falls back to defaults', () => {
    const filters = parseBookFilters(
      new URLSearchParams('genre=Cooking&sortBy=pages&order=sideways&available=maybe'),
    )

    expect(filters.genre).toBe('')
    expect(filters.sortBy).toBe(DEFAULT_BOOK_FILTERS.sortBy)
    expect(filters.order).toBe(DEFAULT_BOOK_FILTERS.order)
    expect(filters.available).toBeUndefined()
  })

  it.each(['0', '-2', '1.5', 'abc'])('falls back to page 1 for page=%s', (page) => {
    expect(parseBookFilters(new URLSearchParams({ page })).page).toBe(1)
  })

  it('parses available=true as a boolean true', () => {
    expect(parseBookFilters(new URLSearchParams('available=true')).available).toBe(true)
  })
})

describe('serializeBookFilters', () => {
  it('omits default values so shareable URLs stay short', () => {
    expect(serializeBookFilters(DEFAULT_BOOK_FILTERS).toString()).toBe('')
  })

  it('writes only non-default values', () => {
    const params = serializeBookFilters({
      ...DEFAULT_BOOK_FILTERS,
      search: 'dune',
      available: false,
      sortBy: 'title',
      order: 'asc',
      page: 2,
    })

    expect(params.toString()).toBe('search=dune&available=false&sortBy=title&order=asc&page=2')
  })

  it('round-trips through parseBookFilters', () => {
    const filters = {
      ...DEFAULT_BOOK_FILTERS,
      genre: 'Mystery' as const,
      publisher: 'Nova',
      author: 'Herbert',
      available: true,
      page: 3,
    }

    expect(parseBookFilters(serializeBookFilters(filters))).toEqual(filters)
  })
})
