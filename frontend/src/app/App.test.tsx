import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the login page at /login', () => {
    window.history.replaceState({}, '', '/login')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible()
    expect(screen.getByLabelText('Correo electrónico')).toBeVisible()
    expect(screen.getByLabelText('Contraseña')).toBeVisible()
  })
})
