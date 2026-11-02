'use client'

import { useEffect, useState } from 'react'
import { formatMoney, formatNumber } from '@/lib/format'

export function CountUp({
  value,
  format = 'number',
}: {
  value: number
  format?: 'money' | 'number'
}) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{format === 'money' ? formatMoney(display) : formatNumber(display)}</>
}
