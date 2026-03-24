'use client'

import { MessagePriority } from '@/types'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: MessagePriority
  size?: 'sm' | 'md'
}

const priorityConfig = {
  [MessagePriority.URGENT]: {
    className: 'bg-danger-dim border-danger text-danger font-bold',
    label: 'Urgent',
  },
  [MessagePriority.FINANCIAL]: {
    className: 'bg-amber-dim border-amber text-amber',
    label: 'Financial',
  },
  [MessagePriority.ACADEMIC]: {
    className: 'bg-accent-dim border-accent text-accent',
    label: 'Academic',
  },
  [MessagePriority.NORMAL]: {
    className: 'bg-surface border-border text-text-muted',
    label: 'Normal',
  },
}

export default function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full border uppercase tracking-wider',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1',
      config.className
    )}>
      {config.label}
    </span>
  )
}
