import { useEffect, useState } from 'react'
import type { Book } from '../../../entities/book'
import { getBook } from '../books.api'

interface LoadedBook {
  id: string
  book: Book | null
  error: Error | null
}

export interface UseBookResult {
  book: Book | null
  error: Error | null
  isLoading: boolean
}

export function useBook(id: string): UseBookResult {
  const [loaded, setLoaded] = useState<LoadedBook | null>(null)
  const isCurrent = loaded !== null && loaded.id === id

  useEffect(() => {
    let active = true

    getBook(id)
      .then((book) => {
        if (active) setLoaded({ id, book, error: null })
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoaded({
            id,
            book: null,
            error: cause instanceof Error ? cause : new Error('Error desconocido'),
          })
        }
      })

    return () => {
      active = false
    }
  }, [id])

  return {
    book: isCurrent ? loaded.book : null,
    error: isCurrent ? loaded.error : null,
    isLoading: !isCurrent,
  }
}
