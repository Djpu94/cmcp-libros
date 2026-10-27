import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  it('keeps the previous value until the delay elapses', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 50), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    await act(() => new Promise((resolve) => setTimeout(resolve, 80)))
    expect(result.current).toBe('b')
  })

  it('only emits the last value when updates arrive within the delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 50), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    rerender({ value: 'abc' })

    await act(() => new Promise((resolve) => setTimeout(resolve, 80)))
    expect(result.current).toBe('abc')
  })
})
