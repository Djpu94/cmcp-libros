import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_BOOK_FILTERS, type BookFilterState } from '../books.filters'
import { BookFilters } from './BookFilters'

function renderFilters(overrides: Partial<BookFilterState> = {}) {
  const setFilter = vi.fn()
  const onReset = vi.fn()
  const filters = { ...DEFAULT_BOOK_FILTERS, ...overrides }

  render(<BookFilters filters={filters} setFilter={setFilter} onReset={onReset} />)

  return { setFilter, onReset }
}

describe('BookFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports text edits for title, publisher and author', () => {
    const { setFilter } = renderFilters()

    fireEvent.change(screen.getByLabelText('Buscar por título'), { target: { value: 'dune' } })
    fireEvent.change(screen.getByLabelText('Editorial'), { target: { value: 'Nova' } })
    fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'Herbert' } })

    expect(setFilter).toHaveBeenNthCalledWith(1, 'search', 'dune')
    expect(setFilter).toHaveBeenNthCalledWith(2, 'publisher', 'Nova')
    expect(setFilter).toHaveBeenNthCalledWith(3, 'author', 'Herbert')
  })

  it('reports a valid genre and clears the filter for the "all genres" option', () => {
    const { setFilter } = renderFilters({ genre: 'Fantasy' })
    const genre = screen.getByLabelText('Género')

    fireEvent.change(genre, { target: { value: 'Mystery' } })
    fireEvent.change(genre, { target: { value: '' } })

    expect(setFilter).toHaveBeenNthCalledWith(1, 'genre', 'Mystery')
    expect(setFilter).toHaveBeenNthCalledWith(2, 'genre', '')
  })

  it('toggles the availability filter with the checkbox', () => {
    const { setFilter } = renderFilters()

    fireEvent.click(screen.getByLabelText('Solo disponibles'))

    expect(setFilter).toHaveBeenLastCalledWith('available', true)
  })

  it('clears the availability filter when the checkbox is unchecked', () => {
    const { setFilter } = renderFilters({ available: true })

    fireEvent.click(screen.getByLabelText('Solo disponibles'))

    expect(setFilter).toHaveBeenLastCalledWith('available', undefined)
  })

  it('ignores an unknown sort field instead of forwarding it', () => {
    const { setFilter } = renderFilters()
    const sort = screen.getByLabelText('Ordenar por')

    fireEvent.change(sort, { target: { value: 'not-a-field' } })

    expect(setFilter).not.toHaveBeenCalled()
  })

  it('treats an unknown genre value as "all genres"', () => {
    const { setFilter } = renderFilters({ genre: 'Fantasy' })

    fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'NotAGenre' } })

    expect(setFilter).toHaveBeenLastCalledWith('genre', '')
  })

  it('shows the availability checkbox as checked when the filter is active', () => {
    renderFilters({ available: true })

    expect(screen.getByLabelText('Solo disponibles')).toBeChecked()
  })

  it('reports the chosen sort field', () => {
    const { setFilter } = renderFilters()

    fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'price' } })

    expect(setFilter).toHaveBeenCalledWith('sortBy', 'price')
  })

  it('flips the sort order from the order button and describes the next state', () => {
    const { setFilter } = renderFilters({ order: 'desc' })
    const orderButton = screen.getByRole('button', {
      name: 'Orden descendente, cambiar a ascendente',
    })

    fireEvent.click(orderButton)

    expect(setFilter).toHaveBeenCalledWith('order', 'asc')
  })

  it('delegates reset to the parent', () => {
    const { onReset } = renderFilters()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
