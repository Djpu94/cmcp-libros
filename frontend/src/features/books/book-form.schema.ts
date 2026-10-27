import { z } from 'zod'
import type { Book } from '../../entities/book'
import { BOOK_GENRES } from './books.constants'
import type { CreateBookPayload, UpdateBookPayload } from './books.api'

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const bookFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  author: z.string().trim().min(1, 'El autor es obligatorio'),
  publisher: z.string().trim().min(1, 'La editorial es obligatoria'),
  price: z
    .number({ error: 'Ingresa un precio válido' })
    .gt(0, 'El precio debe ser mayor que 0'),
  genre: z.string().refine((value) => (BOOK_GENRES as readonly string[]).includes(value), 'Selecciona un género'),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isHttpUrl(value), 'Ingresa una URL válida (http o https)'),
  available: z.boolean(),
})

export type BookFormValues = z.infer<typeof bookFormSchema>

export function bookToFormValues(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    price: Number(book.price),
    genre: book.genre,
    imageUrl: book.imageUrl ?? '',
    available: book.available,
  }
}

export const EMPTY_BOOK_FORM_VALUES: BookFormValues = {
  title: '',
  author: '',
  publisher: '',
  price: NaN,
  genre: '',
  imageUrl: '',
  available: true,
}

export function buildCreatePayload(values: BookFormValues): CreateBookPayload {
  return {
    title: values.title,
    author: values.author,
    publisher: values.publisher,
    price: values.price,
    genre: values.genre,
    available: values.available,
    ...(values.imageUrl === '' ? {} : { imageUrl: values.imageUrl }),
  }
}

/** Sends only the fields that differ from the book as loaded, so PATCH stays partial. */
export function buildUpdatePayload(initial: BookFormValues, values: BookFormValues): UpdateBookPayload {
  const payload: UpdateBookPayload = {}
  if (values.title !== initial.title) payload.title = values.title
  if (values.author !== initial.author) payload.author = values.author
  if (values.publisher !== initial.publisher) payload.publisher = values.publisher
  if (values.price !== initial.price) payload.price = values.price
  if (values.genre !== initial.genre) payload.genre = values.genre
  if (values.available !== initial.available) payload.available = values.available
  if (values.imageUrl !== initial.imageUrl) {
    payload.imageUrl = values.imageUrl === '' ? null : values.imageUrl
  }
  return payload
}
