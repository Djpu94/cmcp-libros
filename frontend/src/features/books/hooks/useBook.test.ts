import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import { useBook } from './useBook'

vi.mock('../../../lib/http', () => ({
  http: { get: vi.fn() },
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

function bookResponse(data: unknown) {
  return { data: { statusCode: 200, timestamp: '', data } }
}

describe('useBook', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
  })

  it('reports loading until the book arrives', async () => {
    vi.mocked(http.get).mockResolvedValue(bookResponse(book))

    const { result } = renderHook(() => useBook('book-1'))

    expect(result.current).toEqual({ book: null, error: null, isLoading: true })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.book).toEqual(book)
    expect(result.current.error).toBeNull()
  })

  it('requests the book with an encoded id', async () => {
    vi.mocked(http.get).mockResolvedValue(bookResponse(book))

    renderHook(() => useBook('a/b c'))

    await waitFor(() => expect(http.get).toHaveBeenCalledWith('/books/a%2Fb%20c'))
  })

  it('exposes the error when the book cannot be loaded', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useBook('missing'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Not found')
    expect(result.current.book).toBeNull()
  })

  it('wraps non-Error rejections in a generic error', async () => {
    vi.mocked(http.get).mockRejectedValue('network down')

    const { result } = renderHook(() => useBook('missing'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Error desconocido')
  })

  it('does not show the previous book while loading a different id', async () => {
    vi.mocked(http.get).mockResolvedValueOnce(bookResponse(book))
    const { result, rerender } = renderHook(({ id }) => useBook(id), {
      initialProps: { id: 'book-1' },
    })
    await waitFor(() => expect(result.current.book).toEqual(book))

    vi.mocked(http.get).mockReturnValueOnce(new Promise(() => {}))
    rerender({ id: 'book-2' })

    expect(result.current).toEqual({ book: null, error: null, isLoading: true })
  })

  it('ignores a response that arrives after unmount', async () => {
    let resolveRequest: (value: unknown) => void = () => {}
    vi.mocked(http.get).mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const { result, unmount } = renderHook(() => useBook('book-1'))

    unmount()
    resolveRequest(bookResponse(book))
    await Promise.resolve()

    expect(result.current.book).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })
})
