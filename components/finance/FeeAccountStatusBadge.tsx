'use client'

import { FeeAccountStatus } from '@/types'
import { cn } from '@/lib/utils'

interface FeeAccountStatusBadgeProps {
  status: FeeAccountStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<FeeAccountStatus, { label: string; className: string }> = {
  [FeeAccountStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-[var(--text-faint)]/20 text-[var(--text-muted)]',
  },
  [FeeAccountStatus.PARTIAL]: {
    label: 'Partial',
    className: 'bg-[var(--amber-dim)] text-[var(--amber)]',
  },
  [FeeAccountStatus.CLEARED]: {
    label: 'Cleared',
    className: 'bg-[var(--success-dim)] text-[var(--success)]',
  },
  [FeeAccountStatus.OVERPAID]: {
    label: 'Overpaid',
    className: 'bg-[rgba(139,92,246,0.12)] text-[#8B5CF6]',
  },
}

export default function FeeAccountStatusBadge({ status, size = 'md' }: FeeAccountStatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex rounded-full font-semibold uppercase tracking-wider',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}
