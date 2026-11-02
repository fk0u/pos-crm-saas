'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

type ToastInput = { title: string; description?: string; tone?: 'success' | 'error' }
type ToastItem = ToastInput & { id: number }

const ToastContext = createContext<(toast: ToastInput) => void>(() => {})

let toastSeed = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const push = useCallback((toast: ToastInput) => {
    toastSeed += 1
    const id = toastSeed
    setToasts((current) => [...current.slice(-2), { ...toast, id }])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3800)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[80] grid justify-items-center gap-2 sm:inset-x-auto sm:right-6 sm:justify-items-end lg:bottom-6 print:hidden"
      >
        {toasts.map((toast) => {
          const Icon = toast.tone === 'error' ? CircleAlert : CircleCheck
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-fade-up"
            >
              <Icon
                className={`mt-0.5 size-5 shrink-0 ${toast.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{toast.description}</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
