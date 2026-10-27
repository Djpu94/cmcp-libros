export const BOOK_IMAGE_TYPES = ['image/png', 'image/jpeg'] as const
export const BOOK_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const BOOK_IMAGE_ACCEPT = BOOK_IMAGE_TYPES.join(',')

/** Returns a user-facing message when the file is not acceptable, or `null` when it is. */
export function validateBookImageFile(file: File): string | null {
  if (!(BOOK_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Formato no válido. Sube una imagen PNG o JPG.'
  }
  if (file.size > BOOK_IMAGE_MAX_BYTES) {
    return 'La imagen supera el tamaño máximo de 5 MB.'
  }
  return null
}
