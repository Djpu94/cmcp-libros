import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, LoginForm, useAuth } from '../features/auth'
import { Button, Toast } from '../shared/ui'
import { ProtectedRoute } from './ProtectedRoute'
import './app.css'

function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">L</div>
        <p className="eyebrow">CMCP · Biblioteca</p>
        <h1 id="login-title">Bienvenido de nuevo</h1>
        <p className="auth-description">Inicia sesión para administrar tu colección de libros.</p>
        <LoginForm />
      </section>
      <footer className="page-footer">Una biblioteca para compartir conocimiento.</footer>
    </main>
  )
}

function BooksPlaceholder() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="books-placeholder">
      <div className="books-header">
        <div>
          <p className="eyebrow">CMCP · Biblioteca</p>
          <h1>Libros</h1>
          <p>La gestión de libros estará disponible próximamente.</p>
        </div>
        <div className="account-actions">
          {user && <span>{user.email}</span>}
          <Button type="button" className="button--secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </main>
  )
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/books" element={<BooksPlaceholder />} />
        </Route>
        <Route path="/" element={<Navigate to="/books" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
