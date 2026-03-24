import { Severity } from '@/types'
import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: Severity
}

const severityConfig = {
  [Severity.LOW]: 'bg-success/10 text-success border-success',
  [Severity.MEDIUM]: 'bg-amber/10 text-amber border-amber',
  [Severity.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500',
  [Severity.CRITICAL]: 'bg-danger/10 text-danger border-danger font-bold animate-pulse-slow',
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase border tracking-wider',
      severityConfig[severity]
    )}>
      {severity}
    </span>
  )
}
