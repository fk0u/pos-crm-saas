import type { ReactNode } from 'react'
import { Card } from './card'

export function DataTable({ headings, children }: { headings: string[]; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              {headings.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </Card>
  )
}

export function TableCell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={`whitespace-nowrap px-5 py-4 text-sm text-slate-600 ${className}`}>
      {children}
    </td>
  )
}
