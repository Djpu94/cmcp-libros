import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '../../lib/http'
import { uploadBookCover } from './books.api'

vi.mock('../../lib/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/http')>()),
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

describe('uploadBookCover', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
  })

  it('sends a multipart body and lets the browser set the boundary', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { data: { imageUrl: 'http://localhost:3000/uploads/books/a.jpg' } } })
    const file = new File(['jpg'], 'cover.jpg', { type: 'image/jpeg' })

    const imageUrl = await uploadBookCover(file)

    expect(imageUrl).toBe('http://localhost:3000/uploads/books/a.jpg')
    const [url, body, config] = vi.mocked(http.post).mock.calls[0]
    expect(url).toBe('/books/cover')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('file')).toBeInstanceOf(File)
    expect(config?.headers).toEqual({ 'Content-Type': undefined })
  })
})
