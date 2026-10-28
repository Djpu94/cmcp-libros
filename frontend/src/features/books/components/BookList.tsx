import { useState } from 'react'
import type { Book } from '../../../entities/book'
import { notifyToast } from '../../../shared/ui/toast-store'
import { Spinner } from '../../../shared/ui'
import { deleteBook, exportCsv } from '../books.api'
import { bookStyles } from '../books.styles'
import { useBooks } from '../hooks/useBooks'
import { BookFilters } from './BookFilters'
import { BookPagination } from './BookPagination'
import { BookTable } from './BookTable'

export function BookList() {
  const { data, total, totalPages, isLoading, error, filters, setFilter, resetFilters, reload } = useBooks()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportCsv(filters)
    } catch {
      notifyToast('No se pudo exportar el CSV')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleDelete(book: Book) {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return
    setDeletingId(book.id)
    try {
      await deleteBook(book.id)
      notifyToast('Libro eliminado', 'success')
      reload()
    } catch {
      notifyToast('No se pudo eliminar el libro')
    } finally {
      setDeletingId(null)
    }
  }

  const hasFilters =
    filters.search !== '' ||
    filters.genre !== '' ||
    filters.publisher !== '' ||
    filters.author !== '' ||
    filters.available !== undefined

  return (
    <section className={bookStyles.list} aria-labelledby="books-list-title">
      <h2 id="books-list-title" className="sr-only">
        Listado de libros
      </h2>

      <BookFilters filters={filters} setFilter={setFilter} onReset={resetFilters} />

      {error && (
        <div className={`${bookStyles.statePanel} ${bookStyles.statePanelError}`} role="alert">
          <p>No se pudieron cargar los libros.</p>
          <button type="button" className={bookStyles.buttonSecondary} onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {isLoading && (
        <div className={bookStyles.statePanel}>
          <Spinner />
        </div>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className={bookStyles.statePanel} role="status">
          <p>No se encontraron libros</p>
          {hasFilters && (
            <button type="button" className={bookStyles.buttonSecondary} onClick={resetFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && data.length > 0 && (
        <>
          <div className={bookStyles.toolbar}>
            <button
              type="button"
              className={bookStyles.buttonSecondary}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exportando…' : 'Exportar CSV'}
            </button>
          </div>
          <BookTable books={data} onDelete={handleDelete} deletingId={deletingId} />
          <BookPagination
            page={filters.page}
            totalPages={totalPages}
            total={total}
            onPageChange={(page) => setFilter('page', page)}
          />
        </>
      )}
    </section>
  )
}
