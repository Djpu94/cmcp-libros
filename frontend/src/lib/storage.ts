const TOKEN_KEY = 'cmcp-access-token'
let tokenInMemory: string | null = null

// sessionStorage survives reloads in this tab, but remains readable to injected JavaScript.
export function getToken(): string | null {
  if (tokenInMemory) return tokenInMemory

  try {
    tokenInMemory = window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    tokenInMemory = null
  }

  return tokenInMemory
}

export function setToken(token: string): void {
  tokenInMemory = token

  try {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function clearToken(): void {
  tokenInMemory = null

  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Clearing the in-memory token still ends the current authenticated session.
  }
}
