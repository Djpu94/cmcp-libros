interface BookPaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function BookPagination({ page, totalPages, total, onPageChange, disabled = false }: BookPaginationProps) {
  const hasPrevious = page > 1
  const hasNext = totalPages > 0 && page < totalPages

  return (
    <nav className="book-pagination" aria-label="Paginación de libros">
      <button
        type="button"
        className="button--secondary"
        aria-label="Página anterior"
        disabled={disabled || !hasPrevious}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {page} de {Math.max(totalPages, 1)} · {total} libros
      </span>
      <button
        type="button"
        className="button--secondary"
        aria-label="Página siguiente"
        disabled={disabled || !hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}
