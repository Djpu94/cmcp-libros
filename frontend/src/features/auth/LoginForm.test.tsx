import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginRequest } from './auth.api'
import { AuthProvider } from './AuthProvider'
import { LoginForm } from './LoginForm'

vi.mock('./auth.api', () => ({ loginRequest: vi.fn() }))

describe('LoginForm', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.mocked(loginRequest).mockReset()
  })

  it('shows accessible validation messages for invalid credentials', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no-es-correo' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeVisible()
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
  })

  it('stores the access token and redirects after a successful login', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      accessToken: 'test-access-token',
      user: { id: 'user-1', email: 'reader@example.com', role: 'USER' },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/books" element={<p>Lista de libros</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'reader@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'valid-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Lista de libros')).toBeVisible()
    expect(sessionStorage.getItem('cmcp-access-token')).toBe('test-access-token')
  })

  it('shows a friendly message when credentials are rejected', async () => {
    vi.mocked(loginRequest).mockRejectedValue(new Error('Internal stack details'))

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'reader@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'valid-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible iniciar sesión.',
    )
    expect(screen.queryByText('Internal stack details')).not.toBeInTheDocument()
  })

  it('disables the submit button while login is pending', async () => {
    vi.mocked(loginRequest).mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'reader@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'valid-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('button', { name: /Iniciar sesión/ })).toBeDisabled()
  })
})
