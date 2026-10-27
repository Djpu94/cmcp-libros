import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import type { Book } from '../../../entities/book'
import { notifyToast } from '../../../shared/ui/toast-store'
import { BookList } from './BookList'

vi.mock('../../../lib/http', () => ({
  http: { get: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../../shared/ui/toast-store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../shared/ui/toast-store')>()),
  notifyToast: vi.fn(),
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
    vi.mocked(http.delete).mockReset()
    vi.mocked(notifyToast).mockReset()
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

  it('shows the empty state without a reset action when no filters are active', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse([]))
    renderList()

    expect(await screen.findByText('No se encontraron libros')).toBeInTheDocument()
    expect(within(screen.getByRole('status')).queryByRole('button')).not.toBeInTheDocument()
  })

  it('retries loading when the user presses Reintentar', async () => {
    vi.mocked(http.get).mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(pageResponse(books))
    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('table', { name: 'Listado de libros' })).toBeInTheDocument()
    expect(http.get).toHaveBeenCalledTimes(2)
  })

  it('deletes a book after confirmation, notifies and reloads the list', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books))
    vi.mocked(http.delete).mockResolvedValue({})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Dune' }))

    await waitFor(() => expect(http.delete).toHaveBeenCalledWith('/books/2'))
    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar "Dune"?')
    expect(notifyToast).toHaveBeenCalledWith('Libro eliminado', 'success')
    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(2))
  })

  it('does not delete when the confirmation is cancelled', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books))
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Dune' }))

    expect(http.delete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Eliminar Dune' })).toBeEnabled()
  })

  it('keeps the row and notifies when deletion fails', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books))
    vi.mocked(http.delete).mockRejectedValue(new Error('conflict'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Dune' }))

    await waitFor(() =>
      expect(notifyToast).toHaveBeenCalledWith('No se pudo eliminar el libro'),
    )
    expect(screen.getByRole('button', { name: 'Eliminar Dune' })).toBeEnabled()
    expect(screen.getByRole('rowheader', { name: 'Dune' })).toBeInTheDocument()
  })

  it('disables the delete action of a book while its deletion is pending', async () => {
    vi.mocked(http.get).mockResolvedValue(pageResponse(books))
    vi.mocked(http.delete).mockReturnValue(new Promise(() => {}))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Dune' }))

    expect(await screen.findByRole('button', { name: 'Eliminar Dune' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar El Hobbit' })).toBeEnabled()
  })
})
