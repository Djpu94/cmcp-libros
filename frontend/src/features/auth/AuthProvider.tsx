import { useMemo, useState, type ReactNode } from 'react'
import { clearToken, getToken, setToken } from '../../lib/storage'
import { loginRequest } from './auth.api'
import { AuthContext } from './auth-context'
import type { AuthUser, LoginCredentials } from './auth.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()))

  async function login(credentials: LoginCredentials): Promise<void> {
    const result = await loginRequest(credentials)
    setToken(result.accessToken)
    setUser(result.user)
    setHasToken(true)
  }

  function logout(): void {
    clearToken()
    setUser(null)
    setHasToken(false)
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: hasToken, login, logout }),
    [user, hasToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
