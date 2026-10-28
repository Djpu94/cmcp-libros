import { Link } from 'react-router-dom'
import type { Book } from '../../../entities/book'
import { priceFormatter } from '../books.format'
import { bookStyles } from '../books.styles'

interface BookTableProps {
  books: Book[]
  onDelete: (book: Book) => void
  deletingId: string | null
}


export function BookTable({ books, onDelete, deletingId }: BookTableProps) {
  return (
    <div className={bookStyles.tableWrapper}>
      <table className={bookStyles.table}>
        <caption className={bookStyles.tableCaption}>Listado de libros</caption>
        <thead>
          <tr>
            <th scope="col" className={bookStyles.tableHeadCell}>Título</th>
            <th scope="col" className={bookStyles.tableHeadCell}>Autor</th>
            <th scope="col" className={bookStyles.tableHeadCell}>Editorial</th>
            <th scope="col" className={bookStyles.tableHeadCell}>Precio</th>
            <th scope="col" className={bookStyles.tableHeadCell}>Disponible</th>
            <th scope="col" className={bookStyles.tableHeadCell}>Género</th>
            <th scope="col" className={bookStyles.tableHeadCell}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <th scope="row" className={bookStyles.tableCell}>{book.title}</th>
              <td className={bookStyles.tableCell}>{book.author}</td>
              <td className={bookStyles.tableCell}>{book.publisher}</td>
              <td className={bookStyles.tableCell}>{priceFormatter.format(Number(book.price))}</td>
              <td className={bookStyles.tableCell}>{book.available ? 'Sí' : 'No'}</td>
              <td className={bookStyles.tableCell}>{book.genre}</td>
              <td className={bookStyles.tableCell}>
                <div className={bookStyles.tableActions}>
                  <Link to={`/books/${book.id}`} className={bookStyles.tableLink} aria-label={`Ver ${book.title}`}>
                    Ver
                  </Link>
                  <Link to={`/books/${book.id}/edit`} className={bookStyles.tableLink} aria-label={`Editar ${book.title}`}>
                    Editar
                  </Link>
                  <button
                    type="button"
                    className={bookStyles.buttonDanger}
                    aria-label={`Eliminar ${book.title}`}
                    disabled={deletingId === book.id}
                    onClick={() => onDelete(book)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
