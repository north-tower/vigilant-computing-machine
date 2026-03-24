import { cn } from '@/lib/utils'

interface AttendanceRateBarProps {
  label: string
  rate: number
  total: number
}

export default function AttendanceRateBar({ label, rate, total }: AttendanceRateBarProps) {
  const rateColor = rate >= 90 ? 'bg-success' : rate >= 75 ? 'bg-amber' : 'bg-danger'

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 text-sm text-text-muted font-medium">{label}</div>
      <div className="flex-1 bg-border rounded-full h-2">
        <div className={cn('h-2 rounded-full', rateColor)} style={{ width: `${rate}%` }}></div>
      </div>
      <div className="w-12 text-right font-mono text-sm text-text">{rate.toFixed(1)}%</div>
    </div>
  )
}
