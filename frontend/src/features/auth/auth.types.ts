export interface AuthUser {
  id: string
  email: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  timestamp: string
}
