import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../../lib/http'
import type { Book } from '../../../entities/book'
import { BookForm } from './BookForm'

vi.mock('../../../lib/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/http')>()),
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const existingBook: Book = {
  id: '1',
  title: 'El Hobbit',
  author: 'J. R. R. Tolkien',
  publisher: 'Minotauro',
  price: '19.90',
  available: true,
  genre: 'Fantasy',
  imageUrl: null,
}

function renderForm(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/books" element={<p>Listado de libros en pantalla</p>} />
        <Route path="/books/new" element={<BookForm />} />
        <Route path="/books/:id/edit" element={<BookForm bookId="1" />} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillValidCreateForm() {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Dune' } })
  fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'Frank Herbert' } })
  fireEvent.change(screen.getByLabelText('Editorial'), { target: { value: 'Nova' } })
  fireEvent.change(screen.getByLabelText('Precio (€)'), { target: { value: '24.5' } })
  fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'Science Fiction' } })
}

describe('BookForm', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
    vi.mocked(http.patch).mockReset()
    URL.createObjectURL = vi.fn(() => 'blob:preview-url')
    URL.revokeObjectURL = vi.fn()
  })

  describe('create mode', () => {
    it('shows inline errors for every required field when submitted empty', async () => {
      renderForm('/books/new')

      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('El autor es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La editorial es obligatoria')).toBeInTheDocument()
      expect(screen.getByText('Ingresa un precio válido')).toBeInTheDocument()
      expect(
        screen.getAllByText('Selecciona un género').some((element) => element.tagName !== 'OPTION'),
      ).toBe(true)
      expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
      expect(http.post).not.toHaveBeenCalled()
    })

    it('shows the error on blur before any submit', async () => {
      renderForm('/books/new')

      const title = screen.getByLabelText('Título')
      fireEvent.focus(title)
      fireEvent.blur(title)

      expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument()
    })

    it.each(['0', '-5'])('rejects a price of %s', async (price) => {
      renderForm('/books/new')

      fireEvent.change(screen.getByLabelText('Precio (€)'), { target: { value: price } })
      fireEvent.blur(screen.getByLabelText('Precio (€)'))

      expect(await screen.findByText('El precio debe ser mayor que 0')).toBeInTheDocument()
    })

    it('accepts decimal prices', async () => {
      renderForm('/books/new')

      fireEvent.change(screen.getByLabelText('Precio (€)'), { target: { value: '0.01' } })
      fireEvent.blur(screen.getByLabelText('Precio (€)'))

      await waitFor(() => expect(screen.queryByText('El precio debe ser mayor que 0')).not.toBeInTheDocument())
      expect(screen.getByLabelText('Precio (€)')).toHaveValue(0.01)
    })

    it('rejects an invalid image URL', async () => {
      renderForm('/books/new')

      fireEvent.change(screen.getByLabelText('URL de la portada'), { target: { value: 'ftp-no' } })
      fireEvent.blur(screen.getByLabelText('URL de la portada'))

      expect(await screen.findByText('Ingresa una URL válida (http o https)')).toBeInTheDocument()
    })

    it('creates the book and redirects to /books when the form is valid', async () => {
      vi.mocked(http.post).mockResolvedValue({ data: { data: { ...existingBook, id: '2' } } })
      renderForm('/books/new')

      fillValidCreateForm()
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('Listado de libros en pantalla')).toBeInTheDocument()
      expect(http.post).toHaveBeenCalledWith('/books', {
        title: 'Dune',
        author: 'Frank Herbert',
        publisher: 'Nova',
        price: 24.5,
        genre: 'Science Fiction',
        available: true,
      })
    })

    it('keeps the user input and shows an inline banner when the API fails', async () => {
      vi.mocked(http.post).mockRejectedValue(new Error('Server down'))
      renderForm('/books/new')

      fillValidCreateForm()
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el libro')
      expect(screen.getByLabelText('Título')).toHaveValue('Dune')
      expect(screen.getByLabelText('Autor')).toHaveValue('Frank Herbert')
      expect(screen.getByLabelText('Precio (€)')).toHaveValue(24.5)
      expect(screen.getByLabelText('Género')).toHaveValue('Science Fiction')
    })

    it('shows a preview for a valid PNG image', async () => {
      renderForm('/books/new')

      const file = new File(['png'], 'cover.png', { type: 'image/png' })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })

      expect(await screen.findByRole('img', { name: 'Vista previa de la portada' })).toHaveAttribute(
        'src',
        'blob:preview-url',
      )
      expect(screen.queryByText(/Formato no válido/)).not.toBeInTheDocument()
    })

    it('uploads the selected image and saves the returned URL', async () => {
      vi.mocked(http.post)
        .mockResolvedValueOnce({ data: { data: { imageUrl: 'http://localhost:3000/uploads/books/abc.png' } } })
        .mockResolvedValueOnce({ data: { data: { id: '2' } } })
      renderForm('/books/new')

      fillValidCreateForm()
      const file = new File(['png'], 'cover.png', { type: 'image/png' })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('Listado de libros en pantalla')).toBeInTheDocument()
      expect(http.post).toHaveBeenNthCalledWith(1, '/books/cover', expect.any(FormData), expect.anything())
      expect(http.post).toHaveBeenNthCalledWith(2, '/books', expect.objectContaining({
        imageUrl: 'http://localhost:3000/uploads/books/abc.png',
      }))
    })

    it('PATCHes the uploaded image URL in edit mode', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: { data: existingBook } })
      vi.mocked(http.post).mockResolvedValue({ data: { data: { imageUrl: 'http://localhost:3000/uploads/books/new.jpg' } } })
      vi.mocked(http.patch).mockResolvedValue({ data: { data: existingBook } })
      renderForm('/books/1/edit')

      await screen.findByLabelText('Título')
      const file = new File(['jpg'], 'cover.jpg', { type: 'image/jpeg' })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('Listado de libros en pantalla')).toBeInTheDocument()
      expect(http.patch).toHaveBeenCalledWith('/books/1', {
        imageUrl: 'http://localhost:3000/uploads/books/new.jpg',
      })
    })

    it('keeps the input and shows a banner when the upload fails', async () => {
      vi.mocked(http.post).mockRejectedValue(new Error('upload failed'))
      renderForm('/books/new')

      fillValidCreateForm()
      const file = new File(['png'], 'cover.png', { type: 'image/png' })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo subir la imagen')
      expect(screen.getByLabelText('Título')).toHaveValue('Dune')
      expect(http.post).toHaveBeenCalledTimes(1)
    })

    it('rejects an unsupported file type with a clear message and no preview', async () => {
      renderForm('/books/new')

      const file = new File(['gif'], 'cover.gif', { type: 'image/gif' })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })

      expect(await screen.findByText('Formato no válido. Sube una imagen PNG o JPG.')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Vista previa de la portada' })).not.toBeInTheDocument()
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })

    it('rejects a file larger than 5 MB', async () => {
      renderForm('/books/new')

      const file = new File(['big'], 'cover.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 })
      fireEvent.change(screen.getByLabelText(/Subir imagen/), { target: { files: [file] } })

      expect(await screen.findByText('La imagen supera el tamaño máximo de 5 MB.')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Vista previa de la portada' })).not.toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('preloads the existing values from the API', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: { data: existingBook } })
      renderForm('/books/1/edit')

      expect(await screen.findByLabelText('Título')).toHaveValue('El Hobbit')
      expect(screen.getByLabelText('Autor')).toHaveValue('J. R. R. Tolkien')
      expect(screen.getByLabelText('Precio (€)')).toHaveValue(19.9)
      expect(screen.getByLabelText('Género')).toHaveValue('Fantasy')
    })

    it('shows a not-found message when the book does not exist', async () => {
      vi.mocked(http.get).mockRejectedValue(
        Object.assign(new Error('Not Found'), { isAxiosError: true, response: { status: 404 } }),
      )
      renderForm('/books/1/edit')

      expect(await screen.findByRole('alert')).toHaveTextContent('Libro no encontrado.')
    })

    it('PATCHes only the fields that changed', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: { data: existingBook } })
      vi.mocked(http.patch).mockResolvedValue({ data: { data: existingBook } })
      renderForm('/books/1/edit')

      const title = await screen.findByLabelText('Título')
      fireEvent.change(title, { target: { value: 'El Hobbit (edición)' } })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('Listado de libros en pantalla')).toBeInTheDocument()
      expect(http.patch).toHaveBeenCalledWith('/books/1', { title: 'El Hobbit (edición)' })
    })

    it('does not call the API when nothing changed', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: { data: existingBook } })
      renderForm('/books/1/edit')

      await screen.findByLabelText('Título')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('Listado de libros en pantalla')).toBeInTheDocument()
      expect(http.patch).not.toHaveBeenCalled()
    })
  })
})
