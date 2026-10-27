import { BOOK_GENRES, BOOK_SORT_FIELDS, BOOK_SORT_LABELS, SORT_ORDER_LABELS, isBookGenre, isBookSortField, type SortOrder } from '../books.constants'
import type { BookFilterState, SetBookFilter } from '../books.filters'

interface BookFiltersProps {
  filters: BookFilterState
  setFilter: SetBookFilter
  onReset: () => void
}

export function BookFilters({ filters, setFilter, onReset }: BookFiltersProps) {
  const nextOrder: SortOrder = filters.order === 'asc' ? 'desc' : 'asc'

  return (
    <form className="book-filters" role="search" aria-label="Filtrar libros" onSubmit={(event) => event.preventDefault()}>
      <div className="book-filters__field">
        <label htmlFor="filter-search">Buscar por título</label>
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
          placeholder="Ej. El Hobbit"
        />
      </div>

      <div className="book-filters__field">
        <label htmlFor="filter-genre">Género</label>
        <select
          id="filter-genre"
          value={filters.genre}
          onChange={(event) => {
            const value = event.target.value
            setFilter('genre', isBookGenre(value) ? value : '')
          }}
        >
          <option value="">Todos los géneros</option>
          {BOOK_GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="book-filters__field">
        <label htmlFor="filter-publisher">Editorial</label>
        <input
          id="filter-publisher"
          type="text"
          value={filters.publisher}
          onChange={(event) => setFilter('publisher', event.target.value)}
        />
      </div>

      <div className="book-filters__field">
        <label htmlFor="filter-author">Autor</label>
        <input
          id="filter-author"
          type="text"
          value={filters.author}
          onChange={(event) => setFilter('author', event.target.value)}
        />
      </div>

      <div className="book-filters__field book-filters__field--checkbox">
        <input
          id="filter-available"
          type="checkbox"
          checked={filters.available === true}
          onChange={(event) => setFilter('available', event.target.checked ? true : undefined)}
        />
        <label htmlFor="filter-available">Solo disponibles</label>
      </div>

      <div className="book-filters__field">
        <label htmlFor="filter-sort">Ordenar por</label>
        <select
          id="filter-sort"
          value={filters.sortBy}
          onChange={(event) => {
            const value = event.target.value
            if (isBookSortField(value)) setFilter('sortBy', value)
          }}
        >
          {BOOK_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {BOOK_SORT_LABELS[field]}
            </option>
          ))}
        </select>
      </div>

      <div className="book-filters__field">
        <button
          type="button"
          className="button--secondary"
          aria-label={`Orden ${SORT_ORDER_LABELS[filters.order].toLowerCase()}, cambiar a ${SORT_ORDER_LABELS[nextOrder].toLowerCase()}`}
          onClick={() => setFilter('order', nextOrder)}
        >
          {filters.order === 'asc' ? 'Ascendente ↑' : 'Descendente ↓'}
        </button>
      </div>

      <div className="book-filters__field">
        <button type="button" className="button--secondary" onClick={onReset}>
          Limpiar filtros
        </button>
      </div>
    </form>
  )
}
