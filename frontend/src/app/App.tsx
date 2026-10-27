import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AuthProvider, LoginForm, useAuth } from '../features/auth'
import { BookDetail } from '../features/books/components/BookDetail'
import { BookForm } from '../features/books/components/BookForm'
import { BookList } from '../features/books/components/BookList'
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

function BooksPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="books-page">
      <div className="books-header">
        <div>
          <p className="eyebrow">CMCP · Biblioteca</p>
          <h1>Libros</h1>
          <p>Explora, filtra y administra la colección.</p>
        </div>
        <div className="account-actions">
          {user && <span>{user.email}</span>}
          <Link to="/books/new" className="button">
            Nuevo libro
          </Link>
          <Button type="button" className="button--secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
      <BookList />
    </main>
  )
}

function BookDetailPage() {
  return (
    <main className="books-page">
      <BookDetail />
    </main>
  )
}

function BookCreatePage() {
  return (
    <main className="books-page">
      <h1>Nuevo libro</h1>
      <BookForm />
    </main>
  )
}

function BookEditPage() {
  const { id = '' } = useParams()
  return (
    <main className="books-page">
      <h1>Editar libro</h1>
      <BookForm bookId={id} />
    </main>
  )
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/new" element={<BookCreatePage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/books/:id/edit" element={<BookEditPage />} />
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
