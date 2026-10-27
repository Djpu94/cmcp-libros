import type { Book, PaginatedResponse } from '../../entities/book'
import { http } from '../../lib/http'
import type { BookFilterState } from './books.filters'

export const PAGE_SIZE = 10

interface ApiResponse<T> {
  statusCode: number
  data: T
  timestamp: string
}

/** Empty values are omitted; axios drops `undefined` query params. */
export function toBookQueryParams(filters: BookFilterState) {
  return {
    search: filters.search.trim() || undefined,
    genre: filters.genre || undefined,
    publisher: filters.publisher.trim() || undefined,
    author: filters.author.trim() || undefined,
    available: filters.available,
    sortBy: filters.sortBy,
    order: filters.order,
    page: filters.page,
    limit: PAGE_SIZE,
  }
}

export async function getBooks(
  filters: BookFilterState,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Book>> {
  const response = await http.get<ApiResponse<PaginatedResponse<Book>>>('/books', {
    params: toBookQueryParams(filters),
    signal,
  })
  return response.data.data
}

export async function getBook(id: string): Promise<Book> {
  const response = await http.get<ApiResponse<Book>>(`/books/${encodeURIComponent(id)}`)
  return response.data.data
}

export interface BookWriteFields {
  title: string
  author: string
  publisher: string
  price: number
  genre: string
  available: boolean
  /** `null` clears the stored image on update. */
  imageUrl: string | null
}

export type CreateBookPayload = Partial<BookWriteFields>
export type UpdateBookPayload = Partial<BookWriteFields>

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const response = await http.post<ApiResponse<Book>>('/books', payload)
  return response.data.data
}

export async function updateBook(id: string, payload: UpdateBookPayload): Promise<Book> {
  const response = await http.patch<ApiResponse<Book>>(`/books/${encodeURIComponent(id)}`, payload)
  return response.data.data
}

export async function uploadBookCover(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  // The instance defaults to JSON; removing it lets the browser set multipart/form-data with its boundary.
  const response = await http.post<ApiResponse<{ imageUrl: string }>>('/books/cover', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data.data.imageUrl
}

export async function deleteBook(id: string): Promise<void> {
  await http.delete(`/books/${encodeURIComponent(id)}`)
}

export async function exportCsv(filters: BookFilterState): Promise<void> {
  const response = await http.get<Blob>('/books/export/csv', {
    params: toBookQueryParams(filters),
    responseType: 'blob',
  })
  const disposition = response.headers['content-disposition'] as string | undefined
  const filename = disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'libros.csv'
  downloadBlob(response.data, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
