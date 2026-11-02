'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  variant = 'side',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  variant?: 'side' | 'center'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('overflow-hidden')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('overflow-hidden')
    }
  }, [open, onClose])

  if (!open) return null

  const panel =
    variant === 'center'
      ? 'absolute inset-x-0 bottom-0 max-h-[94vh] rounded-t-2xl animate-slide-up sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:animate-none'
      : 'absolute inset-x-0 bottom-0 max-h-[94vh] rounded-t-2xl animate-slide-up sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:animate-slide-left'

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={`${panel} flex flex-col overflow-hidden bg-white shadow-2xl`}>
        <div
          className={
            variant === 'center'
              ? 'sm:animate-scale-in flex min-h-0 flex-1 flex-col'
              : 'flex min-h-0 flex-1 flex-col'
          }
        >
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">{title}</p>
              {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel"
              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              <X className="size-4.5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
