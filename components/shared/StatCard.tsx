import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'accent' | 'amber' | 'danger' | 'success' | 'muted'
}

const colorClasses = {
  accent: 'border-accent text-accent',
  amber: 'border-amber text-amber',
  danger: 'border-danger text-danger',
  success: 'border-success text-success',
  muted: 'border-text-muted text-text-muted',
}

export default function StatCard({ label, value, sub, color = 'muted' }: StatCardProps) {
  return (
    <div className={cn(
      'bg-surface border border-border rounded-lg p-5 border-l-4',
      colorClasses[color]
    )}>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  )
}
