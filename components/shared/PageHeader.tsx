import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="pb-5 mb-7 border-b border-border">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  )
}
