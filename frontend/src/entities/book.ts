export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  price: number
  createdAt: string
  updatedAt: string
}

export interface BookFilters {
  search?: string
  page?: number
  limit?: number
  author?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
