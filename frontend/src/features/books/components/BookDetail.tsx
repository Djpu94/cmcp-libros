import { Link, useParams } from 'react-router-dom'
import { getHttpStatus } from '../../../lib/http'
import { Spinner } from '../../../shared/ui'
import { priceFormatter } from '../books.format'
import { useBook } from '../hooks/useBook'
import '../books.css'

export function BookDetail() {
  const { id = '' } = useParams()
  const { book, error, isLoading } = useBook(id)

  if (isLoading) {
    return (
      <div className="book-list__loading">
        <Spinner />
      </div>
    )
  }

  if (error) {
    const message = getHttpStatus(error) === 404 ? 'Libro no encontrado.' : 'No se pudo cargar el libro.'
    return (
      <section className="book-detail">
        <div className="book-list__error" role="alert">
          <p>{message}</p>
        </div>
        <Link to="/books" className="button button--secondary">
          Volver
        </Link>
      </section>
    )
  }

  if (!book) return null

  return (
    <section className="book-detail" aria-labelledby="book-detail-title">
      <div className="book-detail__body">
        {book.imageUrl ? (
          <img className="book-detail__cover" src={book.imageUrl} alt={`Portada de ${book.title}`} />
        ) : (
          <div className="book-detail__cover book-detail__cover--empty" aria-hidden="true">
            Sin portada
          </div>
        )}
        <div className="book-detail__content">
          <h1 id="book-detail-title">{book.title}</h1>
          <dl className="book-detail__fields">
            <dt>Autor</dt>
            <dd>{book.author}</dd>
            <dt>Editorial</dt>
            <dd>{book.publisher}</dd>
            <dt>Precio</dt>
            <dd>{priceFormatter.format(Number(book.price))}</dd>
            <dt>Género</dt>
            <dd>{book.genre}</dd>
            <dt>Disponible</dt>
            <dd>{book.available ? 'Sí' : 'No'}</dd>
          </dl>
        </div>
      </div>
      <div className="book-detail__actions">
        <Link to="/books" className="button button--secondary">
          Volver
        </Link>
        <Link to={`/books/${book.id}/edit`} className="button">
          Editar
        </Link>
      </div>
    </section>
  )
}
