import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export function Button({
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner label="Iniciando sesión" />}
      {children}
    </button>
  )
}
