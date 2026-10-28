import { Link, useParams } from 'react-router-dom'
import { getHttpStatus } from '../../../lib/http'
import { Spinner } from '../../../shared/ui'
import { priceFormatter } from '../books.format'
import { bookStyles } from '../books.styles'
import { useBook } from '../hooks/useBook'

export function BookDetail() {
  const { id = '' } = useParams()
  const { book, error, isLoading } = useBook(id)

  if (isLoading) {
    return (
      <div className={bookStyles.statePanel}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    const message = getHttpStatus(error) === 404 ? 'Libro no encontrado.' : 'No se pudo cargar el libro.'
    return (
      <section className={bookStyles.panel}>
        <div className={`${bookStyles.statePanel} ${bookStyles.statePanelError}`} role="alert">
          <p>{message}</p>
        </div>
        <Link to="/books" className={bookStyles.buttonSecondary}>
          Volver
        </Link>
      </section>
    )
  }

  if (!book) return null

  return (
    <section className={bookStyles.panel} aria-labelledby="book-detail-title">
      <div className={bookStyles.detailBody}>
        {book.imageUrl ? (
          <img className={bookStyles.detailCover} src={book.imageUrl} alt={`Portada de ${book.title}`} />
        ) : (
          <div className={`${bookStyles.detailCover} ${bookStyles.detailCoverEmpty}`} aria-hidden="true">
            Sin portada
          </div>
        )}
        <div>
          <h1 id="book-detail-title" className={bookStyles.detailTitle}>{book.title}</h1>
          <dl className={bookStyles.detailFields}>
            <dt className={bookStyles.detailTerm}>Autor</dt>
            <dd className={bookStyles.detailDescription}>{book.author}</dd>
            <dt className={bookStyles.detailTerm}>Editorial</dt>
            <dd className={bookStyles.detailDescription}>{book.publisher}</dd>
            <dt className={bookStyles.detailTerm}>Precio</dt>
            <dd className={bookStyles.detailDescription}>{priceFormatter.format(Number(book.price))}</dd>
            <dt className={bookStyles.detailTerm}>Género</dt>
            <dd className={bookStyles.detailDescription}>{book.genre}</dd>
            <dt className={bookStyles.detailTerm}>Disponible</dt>
            <dd className={bookStyles.detailDescription}>{book.available ? 'Sí' : 'No'}</dd>
          </dl>
        </div>
      </div>
      <div className={bookStyles.actions}>
        <Link to="/books" className={bookStyles.buttonSecondary}>
          Volver
        </Link>
        <Link to={`/books/${book.id}/edit`} className={bookStyles.buttonPrimary}>
          Editar
        </Link>
      </div>
    </section>
  )
}
