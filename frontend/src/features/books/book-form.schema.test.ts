import { describe, expect, it } from 'vitest'
import type { Book } from '../../entities/book'
import {
  EMPTY_BOOK_FORM_VALUES,
  bookFormSchema,
  bookToFormValues,
  buildCreatePayload,
  buildUpdatePayload,
  isHttpUrl,
  type BookFormValues,
} from './book-form.schema'

const validValues: BookFormValues = {
  title: 'Dune',
  author: 'Frank Herbert',
  publisher: 'Nova',
  price: 24,
  genre: 'Science Fiction',
  imageUrl: '',
  available: true,
}

function messagesFor(overrides: Partial<Record<keyof BookFormValues, unknown>>) {
  const result = bookFormSchema.safeParse({ ...validValues, ...overrides })
  if (result.success) return []
  return result.error.issues.map((issue) => issue.message)
}

describe('isHttpUrl', () => {
  it.each(['http://example.com/cover.png', 'https://example.com/cover.png'])('accepts %s', (url) => {
    expect(isHttpUrl(url)).toBe(true)
  })

  it.each(['ftp://example.com/a.png', 'not a url', 'javascript:alert(1)'])('rejects %s', (url) => {
    expect(isHttpUrl(url)).toBe(false)
  })
})

describe('bookFormSchema', () => {
  it('accepts a complete book without cover', () => {
    expect(bookFormSchema.safeParse(validValues).success).toBe(true)
  })

  it('requires title, author and publisher after trimming', () => {
    expect(messagesFor({ title: '   ' })).toContain('El título es obligatorio')
    expect(messagesFor({ author: '' })).toContain('El autor es obligatorio')
    expect(messagesFor({ publisher: '  ' })).toContain('La editorial es obligatoria')
  })

  it('rejects a missing or non-numeric price', () => {
    expect(messagesFor({ price: NaN })).toContain('Ingresa un precio válido')
  })

  it('rejects a price that is not greater than zero', () => {
    expect(messagesFor({ price: 0 })).toContain('El precio debe ser mayor que 0')
  })

  it('rejects a genre outside the catalogue', () => {
    expect(messagesFor({ genre: 'Cooking' })).toContain('Selecciona un género')
  })

  it('accepts an empty image URL and http(s) URLs only', () => {
    expect(messagesFor({ imageUrl: '' })).toEqual([])
    expect(messagesFor({ imageUrl: 'https://example.com/a.jpg' })).toEqual([])
    expect(messagesFor({ imageUrl: 'ftp://example.com/a.jpg' })).toContain(
      'Ingresa una URL válida (http o https)',
    )
  })

  it('reports an empty EMPTY_BOOK_FORM_VALUES as invalid', () => {
    expect(bookFormSchema.safeParse(EMPTY_BOOK_FORM_VALUES).success).toBe(false)
  })
})

describe('bookToFormValues', () => {
  const book: Book = {
    id: '1',
    title: 'El Hobbit',
    author: 'J. R. R. Tolkien',
    publisher: 'Minotauro',
    price: '19.90',
    available: false,
    genre: 'Fantasy',
    imageUrl: null,
  }

  it('converts the serialized price to a number and empties a missing image', () => {
    expect(bookToFormValues(book)).toEqual({
      title: 'El Hobbit',
      author: 'J. R. R. Tolkien',
      publisher: 'Minotauro',
      price: 19.9,
      genre: 'Fantasy',
      imageUrl: '',
      available: false,
    })
  })
})

describe('buildCreatePayload', () => {
  it('omits imageUrl when the field is empty', () => {
    expect(buildCreatePayload(validValues)).not.toHaveProperty('imageUrl')
  })

  it('includes imageUrl when provided', () => {
    const payload = buildCreatePayload({ ...validValues, imageUrl: 'https://example.com/a.jpg' })

    expect(payload.imageUrl).toBe('https://example.com/a.jpg')
  })
})

describe('buildUpdatePayload', () => {
  it('returns an empty object when nothing changed', () => {
    expect(buildUpdatePayload(validValues, { ...validValues })).toEqual({})
  })

  it('sends only the changed fields', () => {
    const payload = buildUpdatePayload(validValues, {
      ...validValues,
      title: 'Dune Messiah',
      price: 30,
      available: false,
    })

    expect(payload).toEqual({ title: 'Dune Messiah', price: 30, available: false })
  })

  it('sends null to clear an image that was removed', () => {
    const initial = { ...validValues, imageUrl: 'https://example.com/a.jpg' }

    expect(buildUpdatePayload(initial, { ...initial, imageUrl: '' })).toEqual({ imageUrl: null })
  })

  it('sends the new URL when the image changes', () => {
    const initial = { ...validValues, imageUrl: 'https://example.com/a.jpg' }

    expect(buildUpdatePayload(initial, { ...initial, imageUrl: 'https://example.com/b.jpg' })).toEqual({
      imageUrl: 'https://example.com/b.jpg',
    })
  })

  it('updates author, publisher and genre independently', () => {
    expect(
      buildUpdatePayload(validValues, {
        ...validValues,
        author: 'Herbert',
        publisher: 'Ace',
        genre: 'Mystery',
      }),
    ).toEqual({ author: 'Herbert', publisher: 'Ace', genre: 'Mystery' })
  })
})
