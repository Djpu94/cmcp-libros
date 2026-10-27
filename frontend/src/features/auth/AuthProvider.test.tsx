import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearToken } from '../../lib/storage'
import { loginRequest } from './auth.api'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

vi.mock('./auth.api', () => ({ loginRequest: vi.fn() }))

const credentials = { email: 'reader@example.com', password: 'valid-password' }
const session = {
  accessToken: 'token-1',
  user: { id: 'user-1', email: 'reader@example.com', role: 'USER' },
}

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider })
}

describe('useAuth', () => {
  beforeEach(() => {
    clearToken()
    sessionStorage.clear()
    vi.mocked(loginRequest).mockReset()
  })

  it('throws when used outside AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
  })
})

describe('AuthProvider', () => {
  beforeEach(() => {
    clearToken()
    sessionStorage.clear()
    vi.mocked(loginRequest).mockReset()
  })

  it('starts unauthenticated when no token is stored', () => {
    const { result } = renderAuth()

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('restores the authenticated flag from a token stored in this tab', () => {
    sessionStorage.setItem('cmcp-access-token', 'stored-token')

    const { result } = renderAuth()

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('stores the token and exposes the user after a successful login', async () => {
    vi.mocked(loginRequest).mockResolvedValue(session)
    const { result } = renderAuth()

    await act(() => result.current.login(credentials))

    expect(loginRequest).toHaveBeenCalledWith(credentials)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(session.user)
    expect(sessionStorage.getItem('cmcp-access-token')).toBe('token-1')
  })

  it('keeps the user unauthenticated and rethrows when login fails', async () => {
    vi.mocked(loginRequest).mockRejectedValue(new Error('Invalid credentials'))
    const { result } = renderAuth()

    await expect(result.current.login(credentials)).rejects.toThrow('Invalid credentials')

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('cmcp-access-token')).toBeNull()
  })

  it('clears the session on logout', async () => {
    vi.mocked(loginRequest).mockResolvedValue(session)
    const { result } = renderAuth()
    await act(() => result.current.login(credentials))

    act(() => result.current.logout())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('cmcp-access-token')).toBeNull()
  })
})
