import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import type { Book } from '../../../entities/book'
import { getHttpStatus } from '../../../lib/http'
import { notifyToast } from '../../../shared/ui/toast-store'
import { Button, Input, Spinner } from '../../../shared/ui'
import { createBook, updateBook, uploadBookCover } from '../books.api'
import { BOOK_IMAGE_ACCEPT, validateBookImageFile } from '../book-image'
import {
  EMPTY_BOOK_FORM_VALUES,
  bookFormSchema,
  bookToFormValues,
  buildCreatePayload,
  buildUpdatePayload,
  isHttpUrl,
  type BookFormValues,
} from '../book-form.schema'
import { BOOK_GENRES } from '../books.constants'
import { useBook } from '../hooks/useBook'
import '../books.css'

interface BookFormProps {
  /** Present in edit mode; absent when creating a book. */
  bookId?: string
}

export function BookForm({ bookId }: BookFormProps) {
  if (bookId === undefined) return <BookFormFields />
  return <EditBookForm bookId={bookId} />
}

function EditBookForm({ bookId }: { bookId: string }) {
  const { book, error, isLoading } = useBook(bookId)

  if (isLoading) {
    return (
      <div className="book-list__loading">
        <Spinner />
      </div>
    )
  }

  if (error) {
    const message = getHttpStatus(error) === 404 ? 'Libro no encontrado.' : 'No se pudo cargar el libro.'
    return (
      <div className="book-list__error" role="alert">
        <p>{message}</p>
        <Link to="/books" className="button button--secondary">
          Volver
        </Link>
      </div>
    )
  }

  if (!book) return null

  return <BookFormFields book={book} />
}

function BookFormFields({ book }: { book?: Book }) {
  const navigate = useNavigate()
  const initialValues = book ? bookToFormValues(book) : EMPTY_BOOK_FORM_VALUES
  const [apiError, setApiError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const localPreviewRef = useRef<string | null>(null)
  const fileErrorId = useId()
  const genreId = useId()
  const availableId = useId()
  const fileInputId = useId()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  const imageUrl = useWatch({ control, name: 'imageUrl' })
  const urlPreview = imageUrl && isHttpUrl(imageUrl) ? imageUrl : null
  const previewSrc = localPreviewUrl ?? urlPreview

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
    }
  }, [])

  function replaceLocalPreview(url: string | null) {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
    localPreviewRef.current = url
    setLocalPreviewUrl(url)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      setFileError(null)
      setSelectedFile(null)
      replaceLocalPreview(null)
      return
    }

    const message = validateBookImageFile(file)
    setFileError(message)
    setSelectedFile(message ? null : file)
    replaceLocalPreview(message ? null : URL.createObjectURL(file))
  }

  async function onSubmit(values: BookFormValues): Promise<void> {
    setApiError(null)
    let submitted = values
    try {
      if (selectedFile) {
        const imageUrl = await uploadBookCover(selectedFile)
        submitted = { ...values, imageUrl }
      }
    } catch {
      setApiError('No se pudo subir la imagen. Intenta con otro archivo o inténtalo más tarde.')
      return
    }

    try {
      if (book) {
        const changes = buildUpdatePayload(initialValues, submitted)
        if (Object.keys(changes).length > 0) await updateBook(book.id, changes)
      } else {
        await createBook(buildCreatePayload(submitted))
      }
      notifyToast('Libro guardado', 'success')
      navigate('/books', { replace: true })
    } catch {
      setApiError('No se pudo guardar el libro. Revisa los datos e inténtalo nuevamente.')
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && (
        <p className="book-form__error" role="alert">
          {apiError}
        </p>
      )}

      <div className="book-form__grid">
        <Input
          label="Título"
          error={errors.title?.message}
          disabled={isSubmitting}
          {...register('title')}
        />
        <Input
          label="Autor"
          error={errors.author?.message}
          disabled={isSubmitting}
          {...register('author')}
        />
        <Input
          label="Editorial"
          error={errors.publisher?.message}
          disabled={isSubmitting}
          {...register('publisher')}
        />
        <Input
          label="Precio (€)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          error={errors.price?.message}
          disabled={isSubmitting}
          {...register('price', { valueAsNumber: true })}
        />
        <div className="input-field">
          <label htmlFor={genreId}>Género</label>
          <select
            id={genreId}
            className={`text-input ${errors.genre ? 'text-input--error' : ''}`.trim()}
            aria-invalid={Boolean(errors.genre)}
            aria-describedby={errors.genre ? `${genreId}-error` : undefined}
            disabled={isSubmitting}
            {...register('genre')}
          >
            <option value="">Selecciona un género</option>
            {BOOK_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          {errors.genre && (
            <span className="input-error" id={`${genreId}-error`}>
              {errors.genre.message}
            </span>
          )}
        </div>
        <div className="book-form__field--checkbox">
          <input id={availableId} type="checkbox" disabled={isSubmitting} {...register('available')} />
          <label htmlFor={availableId}>Disponible</label>
        </div>
      </div>

      <fieldset className="book-form__image">
        <legend>Portada</legend>
        <Input
          label="URL de la portada"
          type="url"
          placeholder="https://..."
          error={errors.imageUrl?.message}
          disabled={isSubmitting}
          {...register('imageUrl')}
        />
        <div className="input-field">
          <label htmlFor={fileInputId}>Subir imagen (PNG o JPG, máximo 5 MB)</label>
          <input
            id={fileInputId}
            type="file"
            accept={BOOK_IMAGE_ACCEPT}
            disabled={isSubmitting}
            onChange={handleFileChange}
            aria-invalid={Boolean(fileError)}
            aria-describedby={fileError ? fileErrorId : undefined}
          />
          {fileError && (
            <span className="input-error" id={fileErrorId}>
              {fileError}
            </span>
          )}
          <span className="book-form__hint">
            La imagen se sube al guardar el libro y reemplaza la URL de portada indicada arriba.
          </span>
        </div>
        {previewSrc && <img className="book-form__preview" src={previewSrc} alt="Vista previa de la portada" />}
      </fieldset>

      <div className="book-form__actions">
        <Link to={book ? `/books/${book.id}` : '/books'} className="button button--secondary">
          Cancelar
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
