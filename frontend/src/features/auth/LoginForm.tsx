import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button, Input } from '../../shared/ui'

const loginSchema = z.object({
  email: z.email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setFormError(null)
    try {
      await login(values)
      navigate('/books', { replace: true })
    } catch {
      setFormError('No fue posible iniciar sesión. Revisa tus datos e inténtalo nuevamente.')
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="nombre@ejemplo.com"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register('email')}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="Mínimo 6 caracteres"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register('password')}
      />
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
        Iniciar sesión
      </Button>
    </form>
  )
}
