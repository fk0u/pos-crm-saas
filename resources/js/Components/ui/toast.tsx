'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

type ToastInput = { title: string; description?: string; tone?: 'success' | 'error' }
type ToastItem = ToastInput & { id: number }

type ToastFunction = {
  (input: ToastInput | string, maybeToneOrDesc?: string): void
  show: (input: string, descOrTone?: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const noopToast = Object.assign(
  (() => {}) as (input: ToastInput | string, maybeToneOrDesc?: string) => void,
  {
    show: () => {},
    success: () => {},
    error: () => {},
  }
) as ToastFunction

const ToastContext = createContext<ToastFunction>(noopToast)

let toastSeed = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((input: ToastInput | string, maybeToneOrDesc?: string) => {
    toastSeed += 1
    const id = toastSeed
    let item: ToastItem

    if (typeof input === 'string') {
      const isTone = input === 'success' || input === 'error'
      if (isTone) {
        item = {
          id,
          title: maybeToneOrDesc || '',
          tone: input as 'success' | 'error',
        }
      } else {
        item = {
          id,
          title: input,
          tone: maybeToneOrDesc === 'error' || maybeToneOrDesc === 'success' ? maybeToneOrDesc : undefined,
          description: maybeToneOrDesc !== 'error' && maybeToneOrDesc !== 'success' ? maybeToneOrDesc : undefined,
        }
      }
    } else {
      item = { ...input, id }
    }

    setToasts((current) => [...current.slice(-2), item])
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3800)
  }, [])

  const toastValue = Object.assign(push, {
    show: (input: string, descOrTone?: string) => push(input, descOrTone),
    success: (title: string, description?: string) => push({ title, description, tone: 'success' }),
    error: (title: string, description?: string) => push({ title, description, tone: 'error' }),
  }) as ToastFunction

  return (
    <ToastContext.Provider value={toastValue}>
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
