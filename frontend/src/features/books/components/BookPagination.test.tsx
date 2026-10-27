import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookPagination } from './BookPagination'

function renderPagination(props: Partial<Parameters<typeof BookPagination>[0]> = {}) {
  const onPageChange = vi.fn()
  render(
    <BookPagination page={2} totalPages={3} total={25} onPageChange={onPageChange} {...props} />,
  )
  return { onPageChange }
}

describe('BookPagination', () => {
  it('moves to the previous and next pages from the buttons', () => {
    const { onPageChange } = renderPagination()

    fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('disables the previous button on the first page and the next button on the last page', () => {
    renderPagination({ page: 1, totalPages: 1 })

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('disables both buttons while the list is busy', () => {
    renderPagination({ disabled: true })

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('shows at least one page when there are no results', () => {
    renderPagination({ page: 1, totalPages: 0, total: 0 })

    expect(screen.getByText('Página 1 de 1 · 0 libros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })
})
