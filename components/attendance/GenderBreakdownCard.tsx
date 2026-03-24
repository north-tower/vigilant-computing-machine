import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface GenderBreakdownCardProps {
  gender: 'male' | 'female'
  data: { present: number; absent: number; late: number; excused: number; total: number; rate: number }
}

export default function GenderBreakdownCard({ gender, data }: GenderBreakdownCardProps) {
  const color = gender === 'male' ? 'text-accent' : 'text-pink-500'

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-center gap-3">
        <User className={cn("h-6 w-6", color)} />
        <p className="text-lg font-display text-text capitalize">{gender}</p>
      </div>
      <p className={cn("font-display text-4xl mt-4", color)}>{data.rate.toFixed(1)}%</p>
      <div className="mt-4 grid grid-cols-2 gap-1 text-xs text-text-muted">
        <p>Present: {data.present}</p>
        <p>Absent: {data.absent}</p>
        <p>Late: {data.late}</p>
        <p>Excused: {data.excused}</p>
      </div>
    </div>
  )
}
