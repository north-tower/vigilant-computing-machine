import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  message: string
  subMessage?: string
  icon?: LucideIcon
}

export default function EmptyState({ message, subMessage, icon: Icon }: EmptyStateProps) {
  return (
    <div className="text-center p-12 bg-surface/30 border border-border border-dashed rounded-xl flex flex-col items-center justify-center space-y-3">
      {Icon && <Icon className="h-10 w-10 text-text-faint" />}
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-muted">{message}</p>
        {subMessage && <p className="text-xs text-text-faint">{subMessage}</p>}
      </div>
    </div>
  )
}
