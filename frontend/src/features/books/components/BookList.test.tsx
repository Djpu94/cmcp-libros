import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import type { Book } from '../../../entities/book'
import { BookList } from './BookList'

vi.mock('../../../lib/http', () => ({
  http: { get: vi.fn(), delete: vi.fn() },
}))

const books: Book[] = [
  { id: '1', title: 'El Hobbit', author: 'J. R. R. Tolkien', publisher: 'Minotauro', price: '19.90', available: true, genre: 'Fantasy', imageUrl: null },
  { id: '2', title: 'Dune', author: 'Frank Herbert', publisher: 'Nova', price: '24.00', available: false, genre: 'Science Fiction', imageUrl: null },
]

function pageResponse(data: Book[], page = 1, totalPages = 1) {
  return {
    data: {
      statusCode: 200,
      timestamp: '',
      data: { data, total: data.length, page, limit: 10, totalPages },
    },
  }
}

function renderList(initialEntry = '/books') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <BookList />
    </MemoryRouter>,
  )
}

describe('BookList', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
  })

  it('shows a spinner while loading', () => {
    vi.mocked(http.get).mockReturnValue(new Promise(() => {}))
    renderList()

    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })

  it('shows the empty state with a reset button when filters match nothing', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse([]))
    renderList('/books?genre=Fantasy')

    expect(await screen.findByText('No se encontraron libros')).toBeInTheDocument()
    expect(within(screen.getByRole('status')).getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()
  })

  it('shows an accessible error banner when loading fails', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('network'))
    renderList()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los libros.')
  })

  it('renders a row per book in a semantic table', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books))
    renderList()

    const table = await screen.findByRole('table', { name: 'Listado de libros' })
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(books.length + 1)
    expect(within(table).getByRole('rowheader', { name: 'El Hobbit' })).toBeInTheDocument()
    expect(within(table).getByRole('rowheader', { name: 'Dune' })).toBeInTheDocument()
  })

  it('requests the next page when Siguiente is clicked', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books, 1, 3))
    renderList()

    const next = await screen.findByRole('button', { name: 'Página siguiente' })
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()

    vi.mocked(http.get).mockResolvedValue(pageResponse(books, 2, 3))
    fireEvent.click(next)

    await waitFor(() =>
      expect(http.get).toHaveBeenLastCalledWith(
        '/books',
        expect.objectContaining({ params: expect.objectContaining({ page: 2 }) }),
      ),
    )
  })

  it('disables Siguiente on the last page', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books, 3, 3))
    renderList('/books?page=3')

    expect(await screen.findByRole('button', { name: 'Página siguiente' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled()
  })
})
