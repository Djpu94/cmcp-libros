import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../lib/http'
import { loginRequest } from './auth.api'

vi.mock('../../lib/http', () => ({
  http: { post: vi.fn() },
}))

describe('loginRequest', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
  })

  it('posts the credentials and unwraps the access token and user', async () => {
    const user = { id: 'user-1', email: 'reader@example.com', role: 'USER' }
    vi.mocked(http.post).mockResolvedValue({
      data: { statusCode: 200, timestamp: '', data: { accessToken: 'token-1', user } },
    })

    const result = await loginRequest({ email: 'reader@example.com', password: 'secret1' })

    expect(http.post).toHaveBeenCalledWith('/auth/login', {
      email: 'reader@example.com',
      password: 'secret1',
    })
    expect(result).toEqual({ accessToken: 'token-1', user })
  })

  it('propagates the error when the server rejects the credentials', async () => {
    const rejection = Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
    vi.mocked(http.post).mockRejectedValue(rejection)

    await expect(loginRequest({ email: 'a@b.co', password: 'wrong-pass' })).rejects.toBe(rejection)
  })
})
