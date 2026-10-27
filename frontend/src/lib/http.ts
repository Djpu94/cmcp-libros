import axios from 'axios'
import { getToken, clearToken } from './storage'
import { notifyToast } from '../shared/ui/toast-store'

export function getHttpStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const status = error.response?.status
    const isLoginRequest = error.config?.url?.replace(/\/+$/, '').endsWith('/auth/login')

    if (status === 401 && !isLoginRequest) {
      clearToken()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    } else if (status === 403) {
      notifyToast('No autorizado', 'error')
    } else if (status !== undefined && status >= 500) {
      notifyToast('Error del servidor', 'error')
    }

    return Promise.reject(error)
  },
)
