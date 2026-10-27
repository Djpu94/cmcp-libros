import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import type { Book } from '../../../entities/book'
import { BookDetail } from './BookDetail'

vi.mock('../../../lib/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/http')>()),
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const book: Book = {
  id: '7',
  title: 'Dune',
  author: 'Frank Herbert',
  publisher: 'Nova',
  price: '24.00',
  available: false,
  genre: 'Science Fiction',
  imageUrl: 'https://example.com/dune.jpg',
}

function renderDetail(path = '/books/7') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/books" element={<p>Listado</p>} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/books/:id/edit" element={<p>Editor</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BookDetail', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
  })

  it('renders every field and the cover image', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { data: book } })
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Portada de Dune' })).toHaveAttribute('src', book.imageUrl)
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(screen.getByText('Nova')).toBeInTheDocument()
    expect(screen.getByText('Science Fiction')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
    expect(screen.getByText(/24,00\s*€/)).toBeInTheDocument()
    expect(http.get).toHaveBeenCalledWith('/books/7')
  })

  it('shows a placeholder instead of an image when the book has no cover', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { data: { ...book, imageUrl: null } } })
    renderDetail()

    expect(await screen.findByText('Sin portada')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('links to the edit page and back to the list', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { data: book } })
    renderDetail()

    expect(await screen.findByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/books/7/edit')
    expect(screen.getByRole('link', { name: 'Volver' })).toHaveAttribute('href', '/books')
  })

  it('handles a 404 with a not-found message', async () => {
    vi.mocked(http.get).mockRejectedValue(
      new AxiosError('Request failed with status code 404', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 404,
        statusText: 'Not Found',
        data: {},
        headers: {},
        config: { headers: {} } as never,
      }),
    )
    renderDetail()

    expect(await screen.findByRole('alert')).toHaveTextContent('Libro no encontrado.')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver' })).toBeInTheDocument()
  })

  it('shows a generic error for other failures', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('network'))
    renderDetail()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el libro.')
  })
})
