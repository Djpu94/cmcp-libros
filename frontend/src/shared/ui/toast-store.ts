export type ToastKind = 'error' | 'success'
export interface ToastMessage {
  id: number
  message: string
  kind: ToastKind
}

type Listener = (toast: ToastMessage) => void
const listeners = new Set<Listener>()
let nextToastId = 0

export function notifyToast(message: string, kind: ToastKind = 'error'): void {
  const toast = { id: ++nextToastId, message, kind }
  listeners.forEach((listener) => listener(toast))
}

export function subscribeToToasts(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
