import { http } from '../../lib/http'
import type { ApiResponse, LoginCredentials, LoginResponse } from './auth.types'

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
  return response.data.data
}
