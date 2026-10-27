import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import { useBooks } from './useBooks'

vi.mock('../../../lib/http', () => ({
  http: { get: vi.fn(), delete: vi.fn() },
}))

const emptyPage = {
  data: {
    statusCode: 200,
    timestamp: '',
    data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  },
}

function wrapperFor(initialEntry: string) {
  return ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [initialEntry] }, children)
}

function lastParams() {
  const calls = vi.mocked(http.get).mock.calls
  return calls[calls.length - 1][1]?.params
}

describe('useBooks', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.get).mockResolvedValue(emptyPage)
  })

  it('debounces search so typing does not request per keystroke', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books') })
    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(1))

    act(() => {
      result.current.setFilter('search', 't')
      result.current.setFilter('search', 'to')
      result.current.setFilter('search', 'tol')
    })

    expect(http.get).toHaveBeenCalledTimes(1)
    expect(result.current.filters.search).toBe('tol')

    await waitFor(() => expect(lastParams()).toMatchObject({ search: 'tol' }))
    expect(http.get).toHaveBeenCalledTimes(2)
  })

  it('aborts the stale request when a filter changes', async () => {
    vi.mocked(http.get).mockReturnValueOnce(new Promise(() => {}))
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books') })
    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(1))

    const firstSignal = vi.mocked(http.get).mock.calls[0][1]?.signal
    expect(firstSignal?.aborted).toBe(false)

    act(() => result.current.setFilter('genre', 'Fantasy'))

    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(2))
    expect(firstSignal?.aborted).toBe(true)
  })

  it('resets page to 1 when a filter changes', async () => {
    const { result } = renderHook(() => useBooks(), {
      wrapper: wrapperFor('/books?page=3&genre=Fantasy'),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.filters.page).toBe(3)

    act(() => result.current.setFilter('genre', 'Mystery'))

    await waitFor(() => expect(lastParams()).toMatchObject({ genre: 'Mystery', page: 1 }))
    expect(result.current.filters.page).toBe(1)
  })

  it('exposes the error when the request fails', async () => {
    vi.mocked(http.get).mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books') })

    await waitFor(() => expect(result.current.error?.message).toBe('boom'))
    expect(result.current.isLoading).toBe(false)
  })

  it('wraps non-Error rejections in a generic error', async () => {
    vi.mocked(http.get).mockRejectedValueOnce('offline')
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books') })

    await waitFor(() => expect(result.current.error?.message).toBe('Error desconocido'))
    expect(result.current.data).toEqual([])
  })

  it('reloads the current query when reload is called', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books?genre=Fantasy') })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.reload())

    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(2))
    expect(lastParams()).toMatchObject({ genre: 'Fantasy' })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('changes the page without resetting it to 1', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books') })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setFilter('page', 2))

    await waitFor(() => expect(lastParams()).toMatchObject({ page: 2 }))
    expect(result.current.filters.page).toBe(2)
  })

  it('clears every filter and text draft on resetFilters', async () => {
    const { result } = renderHook(() => useBooks(), {
      wrapper: wrapperFor('/books?search=dune&publisher=Nova&genre=Mystery&page=2'),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.filters).toMatchObject({ search: 'dune', publisher: 'Nova', genre: 'Mystery', page: 2 })

    act(() => result.current.resetFilters())

    await waitFor(() =>
      expect(result.current.filters).toMatchObject({ search: '', publisher: '', author: '', genre: '', page: 1 }),
    )
    await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ page: 1 })))
    expect(lastParams()).not.toHaveProperty('genre', 'Mystery')
  })

  it('initialises text filters from the URL', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper: wrapperFor('/books?author=Herbert') })

    expect(result.current.filters.author).toBe('Herbert')
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
