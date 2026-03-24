'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface CollectionProgressBarProps {
  collected: number
  total: number
  label?: string
}

export default function CollectionProgressBar({ collected, total, label }: CollectionProgressBarProps) {
  const [width, setWidth] = useState(0)
  const safeCollected = Number(collected)
  const safeTotal = Number(total)
  const rate = safeTotal > 0 ? (safeCollected / safeTotal) * 100 : 0
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(rate), 100)
    return () => clearTimeout(timer)
  }, [rate])

  const getFillColor = (r: number) => {
    if (r >= 80) return 'bg-success'
    if (r >= 50) return 'bg-amber'
    return 'bg-danger'
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-end">
        {label && <span className="text-sm font-medium text-text">{label}</span>}
        <div className="text-right">
          <span className="text-lg font-bold text-text">{Math.round(rate)}%</span>
          <span className="text-xs text-text-muted ml-2">collected</span>
        </div>
      </div>
      
      <div className="h-3 bg-border rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-[800ms] ease-out",
            getFillColor(rate)
          )}
          style={{ width: `${Math.max(0, Math.min(100, width))}%` }}
        />
      </div>

      <div className="text-[12px] font-mono text-text-muted">
        KES {safeCollected.toLocaleString('en-KE')} collected of KES {safeTotal.toLocaleString('en-KE')}
      </div>
    </div>
  )
}
