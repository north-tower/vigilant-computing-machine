import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: LucideIcon
}

export default function EmptyState({ message, icon: Icon }: EmptyStateProps) {
  return (
    <div className="text-center p-12">
      {Icon && <Icon className="mx-auto h-8 w-8 text-text-faint" />}
      <p className="mt-4 text-sm text-text-muted">{message}</p>
    </div>
  )
}
