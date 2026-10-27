import type { BookGenre, BookSortField, SortOrder } from './books.constants'
import { isBookGenre, isBookSortField } from './books.constants'

export interface BookFilterState {
  search: string
  genre: BookGenre | ''
  publisher: string
  author: string
  available: boolean | undefined
  sortBy: BookSortField
  order: SortOrder
  page: number
}

export type SetBookFilter = <K extends keyof BookFilterState>(
  key: K,
  value: BookFilterState[K],
) => void

export const DEFAULT_BOOK_FILTERS: BookFilterState = {
  search: '',
  genre: '',
  publisher: '',
  author: '',
  available: undefined,
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
}

export function parseBookFilters(params: URLSearchParams): BookFilterState {
  const genre = params.get('genre')
  const sortBy = params.get('sortBy')
  const order = params.get('order')
  const available = params.get('available')
  const page = Number(params.get('page'))

  return {
    search: params.get('search') ?? '',
    genre: genre !== null && isBookGenre(genre) ? genre : '',
    publisher: params.get('publisher') ?? '',
    author: params.get('author') ?? '',
    available: available === 'true' ? true : available === 'false' ? false : undefined,
    sortBy: isBookSortField(sortBy) ? sortBy : DEFAULT_BOOK_FILTERS.sortBy,
    order: order === 'asc' || order === 'desc' ? order : DEFAULT_BOOK_FILTERS.order,
    page: Number.isInteger(page) && page >= 1 ? page : DEFAULT_BOOK_FILTERS.page,
  }
}

/** Serializes only non-default values so shareable URLs stay short. */
export function serializeBookFilters(filters: BookFilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.genre) params.set('genre', filters.genre)
  if (filters.publisher) params.set('publisher', filters.publisher)
  if (filters.author) params.set('author', filters.author)
  if (filters.available !== undefined) params.set('available', String(filters.available))
  if (filters.sortBy !== DEFAULT_BOOK_FILTERS.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.order !== DEFAULT_BOOK_FILTERS.order) params.set('order', filters.order)
  if (filters.page > 1) params.set('page', String(filters.page))

  return params
}
