import { useEffect, useState } from 'react'
import { subscribeToToasts, type ToastMessage } from './toast-store'

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    return subscribeToToasts((toast) => {
      setToasts((current) => [...current, toast])
      window.setTimeout(
        () => setToasts((current) => current.filter((item) => item.id !== toast.id)),
        5000,
      )
    })
  }, [])

  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          className={`toast toast--${toast.kind}`}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          key={toast.id}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
