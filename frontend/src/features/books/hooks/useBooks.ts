import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Book } from '../../../entities/book'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { getBooks } from '../books.api'
import {
  DEFAULT_BOOK_FILTERS,
  parseBookFilters,
  serializeBookFilters,
  type BookFilterState,
  type SetBookFilter,
} from '../books.filters'

const SEARCH_DEBOUNCE_MS = 300

interface TextDraft {
  search: string
  publisher: string
  author: string
}

interface BooksListState {
  data: Book[]
  total: number
  totalPages: number
  isLoading: boolean
  error: Error | null
}

interface LoadedBooks {
  queryKey: string
  reloadToken: number
  data: Book[]
  total: number
  totalPages: number
  error: Error | null
}

export interface UseBooksResult extends BooksListState {
  filters: BookFilterState
  setFilter: SetBookFilter
  resetFilters: () => void
  reload: () => void
}

const EMPTY_DRAFT: TextDraft = { search: '', publisher: '', author: '' }

/**
 * Text filters are kept in local state and committed to the URL after a debounce.
 * Typing therefore never triggers a request per keystroke, and the input stays
 * responsive even when the router defers URL updates.
 */
export function useBooks(): UseBooksResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const urlFilters = useMemo(() => parseBookFilters(new URLSearchParams(queryKey)), [queryKey])

  const [textDraft, setTextDraft] = useState<TextDraft>(() => ({
    search: urlFilters.search,
    publisher: urlFilters.publisher,
    author: urlFilters.author,
  }))
  const debouncedText = useDebounce(textDraft, SEARCH_DEBOUNCE_MS)
  const [reloadToken, setReloadToken] = useState(0)
  const [loaded, setLoaded] = useState<LoadedBooks | null>(null)
  const isCurrent = loaded !== null && loaded.queryKey === queryKey && loaded.reloadToken === reloadToken
  const listState: BooksListState = {
    data: isCurrent ? loaded.data : [],
    total: isCurrent ? loaded.total : 0,
    totalPages: isCurrent ? loaded.totalPages : 0,
    isLoading: !isCurrent,
    error: isCurrent ? loaded.error : null,
  }

  // Commit debounced text to the URL, resetting to page 1 only when a value actually changes.
  useEffect(() => {
    setSearchParams(
      (previous) => {
        const current = parseBookFilters(previous)
        if (
          current.search === debouncedText.search &&
          current.publisher === debouncedText.publisher &&
          current.author === debouncedText.author
        ) {
          return previous
        }
        return serializeBookFilters({ ...current, ...debouncedText, page: 1 })
      },
      { replace: true },
    )
  }, [debouncedText, setSearchParams])

  // Follow external URL changes (back/forward navigation) for text fields.
  const urlTextKey = JSON.stringify([urlFilters.search, urlFilters.publisher, urlFilters.author])
  const [syncedTextKey, setSyncedTextKey] = useState(urlTextKey)
  if (syncedTextKey !== urlTextKey) {
    setSyncedTextKey(urlTextKey)
    setTextDraft((draft) =>
      draft.search === urlFilters.search &&
      draft.publisher === urlFilters.publisher &&
      draft.author === urlFilters.author
        ? draft
        : { search: urlFilters.search, publisher: urlFilters.publisher, author: urlFilters.author },
    )
  }

  useEffect(() => {
    const controller = new AbortController()
    const filters = parseBookFilters(new URLSearchParams(queryKey))

    getBooks(filters, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setLoaded({
          queryKey,
          reloadToken,
          data: result.data,
          total: result.total,
          totalPages: result.totalPages,
          error: null,
        })
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoaded({
          queryKey,
          reloadToken,
          data: [],
          total: 0,
          totalPages: 0,
          error: cause instanceof Error ? cause : new Error('Error desconocido'),
        })
      })

    return () => controller.abort()
  }, [queryKey, reloadToken])

  const setFilter: SetBookFilter = useCallback(
    (key, value) => {
      if (key === 'search' || key === 'publisher' || key === 'author') {
        setTextDraft((draft) => ({ ...draft, [key]: value }))
        return
      }
      setSearchParams((previous) => {
        const current = parseBookFilters(previous)
        const next = { ...current, [key]: value } as BookFilterState
        if (key !== 'page') next.page = 1
        return serializeBookFilters(next)
      })
    },
    [setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setTextDraft(EMPTY_DRAFT)
    setSearchParams(serializeBookFilters(DEFAULT_BOOK_FILTERS))
  }, [setSearchParams])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const filters = useMemo<BookFilterState>(
    () => ({
      ...urlFilters,
      search: textDraft.search,
      publisher: textDraft.publisher,
      author: textDraft.author,
    }),
    [urlFilters, textDraft],
  )

  return {
    ...listState,
    filters,
    setFilter,
    resetFilters,
    reload,
  }
}
