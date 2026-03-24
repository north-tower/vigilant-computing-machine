import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  rows?: number
  cols?: number
  className?: string
}

export default function LoadingSkeleton({ rows = 5, cols = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("w-full animate-pulse", className)}>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-border rounded-md"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
