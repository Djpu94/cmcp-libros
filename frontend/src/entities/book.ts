export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  /** Prisma Decimal values are serialized as strings in JSON. */
  price: string
  available: boolean
  genre: string
  imageUrl: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
