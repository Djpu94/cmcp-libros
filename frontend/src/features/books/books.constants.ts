export const BOOK_GENRES = [
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Biography',
  'History',
  'Children',
] as const

export type BookGenre = (typeof BOOK_GENRES)[number]

export const BOOK_SORT_FIELDS = ['title', 'author', 'price', 'createdAt'] as const

export type BookSortField = (typeof BOOK_SORT_FIELDS)[number]

export const SORT_ORDERS = ['asc', 'desc'] as const

export type SortOrder = (typeof SORT_ORDERS)[number]

export const BOOK_SORT_LABELS: Record<BookSortField, string> = {
  title: 'Título',
  author: 'Autor',
  price: 'Precio',
  createdAt: 'Fecha de alta',
}

export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: 'Ascendente',
  desc: 'Descendente',
}

export function isBookGenre(value: string): value is BookGenre {
  return (BOOK_GENRES as readonly string[]).includes(value)
}

export function isBookSortField(value: string | null): value is BookSortField {
  return value !== null && (BOOK_SORT_FIELDS as readonly string[]).includes(value)
}
