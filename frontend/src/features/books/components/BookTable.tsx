import type { Book } from '../../../entities/book'

interface BookTableProps {
  books: Book[]
  onDelete: (book: Book) => void
  deletingId: string | null
}

const priceFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export function BookTable({ books, onDelete, deletingId }: BookTableProps) {
  return (
    <div className="book-table-wrapper">
      <table className="book-table">
        <caption>Listado de libros</caption>
        <thead>
          <tr>
            <th scope="col">Título</th>
            <th scope="col">Autor</th>
            <th scope="col">Editorial</th>
            <th scope="col">Precio</th>
            <th scope="col">Disponible</th>
            <th scope="col">Género</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <th scope="row">{book.title}</th>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{priceFormatter.format(Number(book.price))}</td>
              <td>{book.available ? 'Sí' : 'No'}</td>
              <td>{book.genre}</td>
              <td>
                <button
                  type="button"
                  className="button--danger"
                  aria-label={`Eliminar ${book.title}`}
                  disabled={deletingId === book.id}
                  onClick={() => onDelete(book)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
