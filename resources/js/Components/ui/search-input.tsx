'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { shortcut?: string }
>(function SearchInput({ shortcut, className = '', ...props }, ref) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={ref}
        type="search"
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-100"
        {...props}
      />
      {shortcut ? (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 sm:block">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  )
})
