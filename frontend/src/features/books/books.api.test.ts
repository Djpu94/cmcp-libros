import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../lib/http'
import {
  createBook,
  deleteBook,
  exportCsv,
  getBook,
  getBooks,
  toBookQueryParams,
  updateBook,
  uploadBookCover,
} from './books.api'
import { DEFAULT_BOOK_FILTERS } from './books.filters'

vi.mock('../../lib/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/http')>()),
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const book = {
  id: 'book-1',
  title: 'Dune',
  author: 'Frank Herbert',
  publisher: 'Nova',
  price: '24.00',
  available: true,
  genre: 'Science Fiction',
  imageUrl: null,
}

describe('toBookQueryParams', () => {
  it('drops empty text filters and trims the rest', () => {
    const params = toBookQueryParams({
      ...DEFAULT_BOOK_FILTERS,
      search: '  dune  ',
      publisher: '   ',
      author: '',
    })

    expect(params).toMatchObject({ search: 'dune', publisher: undefined, author: undefined, genre: undefined })
  })

  it('always sends the fixed page size and the paging fields', () => {
    expect(toBookQueryParams({ ...DEFAULT_BOOK_FILTERS, page: 3 })).toMatchObject({
      page: 3,
      limit: 10,
      sortBy: 'createdAt',
      order: 'desc',
    })
  })
})

describe('book requests', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
    vi.mocked(http.patch).mockReset()
    vi.mocked(http.delete).mockReset()
  })

  it('getBooks unwraps the paginated payload and forwards the abort signal', async () => {
    const page = { data: [book], total: 1, page: 1, limit: 10, totalPages: 1 }
    vi.mocked(http.get).mockResolvedValue({ data: { statusCode: 200, timestamp: '', data: page } })
    const controller = new AbortController()

    const result = await getBooks(DEFAULT_BOOK_FILTERS, controller.signal)

    expect(result).toEqual(page)
    expect(http.get).toHaveBeenCalledWith('/books', {
      params: toBookQueryParams(DEFAULT_BOOK_FILTERS),
      signal: controller.signal,
    })
  })

  it('getBook encodes the id in the path', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { statusCode: 200, timestamp: '', data: book } })

    await expect(getBook('a/b')).resolves.toEqual(book)
    expect(http.get).toHaveBeenCalledWith('/books/a%2Fb')
  })

  it('createBook posts the payload and returns the created book', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { statusCode: 201, timestamp: '', data: book } })

    await expect(createBook({ title: 'Dune' })).resolves.toEqual(book)
    expect(http.post).toHaveBeenCalledWith('/books', { title: 'Dune' })
  })

  it('updateBook patches the encoded id with the partial payload', async () => {
    vi.mocked(http.patch).mockResolvedValue({ data: { statusCode: 200, timestamp: '', data: book } })

    await expect(updateBook('book-1', { available: false })).resolves.toEqual(book)
    expect(http.patch).toHaveBeenCalledWith('/books/book-1', { available: false })
  })

  it('deleteBook calls the encoded resource and resolves without a value', async () => {
    vi.mocked(http.delete).mockResolvedValue({})

    await expect(deleteBook('book 1')).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/books/book%201')
  })
})

describe('exportCsv', () => {
  let clickSpy: ReturnType<typeof vi.spyOn>
  let downloads: Array<{ href: string; download: string }>

  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    downloads = []
    URL.createObjectURL = vi.fn(() => 'blob:csv')
    URL.revokeObjectURL = vi.fn()
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push({ href: this.href, download: this.download })
    })
  })

  afterEach(() => {
    clickSpy.mockRestore()
  })

  it('downloads the blob using the filename from Content-Disposition', async () => {
    const blob = new Blob(['title'], { type: 'text/csv' })
    vi.mocked(http.get).mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="export-2026.csv"' },
    })

    await exportCsv({ ...DEFAULT_BOOK_FILTERS, genre: 'Fantasy' })

    expect(http.get).toHaveBeenCalledWith('/books/export/csv', {
      params: toBookQueryParams({ ...DEFAULT_BOOK_FILTERS, genre: 'Fantasy' }),
      responseType: 'blob',
    })
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(downloads).toEqual([{ href: 'blob:csv', download: 'export-2026.csv' }])
    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('falls back to libros.csv when no filename is provided', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: new Blob(['x']), headers: {} })

    await exportCsv(DEFAULT_BOOK_FILTERS)

    expect(downloads[0].download).toBe('libros.csv')
  })
})

describe('uploadBookCover', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
  })

  it('sends a multipart body and lets the browser set the boundary', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { data: { imageUrl: 'http://localhost:3000/uploads/books/a.jpg' } } })
    const file = new File(['jpg'], 'cover.jpg', { type: 'image/jpeg' })

    const imageUrl = await uploadBookCover(file)

    expect(imageUrl).toBe('http://localhost:3000/uploads/books/a.jpg')
    const [url, body, config] = vi.mocked(http.post).mock.calls[0]
    expect(url).toBe('/books/cover')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('file')).toBeInstanceOf(File)
    expect(config?.headers).toEqual({ 'Content-Type': undefined })
  })
})
