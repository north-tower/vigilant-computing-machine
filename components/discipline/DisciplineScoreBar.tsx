import { cn } from '@/lib/utils'

interface DisciplineScoreBarProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function DisciplineScoreBar({ score, showLabel = true, size = 'md' }: DisciplineScoreBarProps) {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-success bg-success'
    if (val >= 60) return 'text-amber bg-amber'
    if (val >= 40) return 'text-orange-500 bg-orange-500'
    return 'text-danger bg-danger'
  }

  const getStanding = (val: number) => {
    if (val >= 80) return 'Good Standing'
    if (val >= 60) return 'Needs Attention'
    if (val >= 40) return 'At Risk'
    return 'Critical'
  }

  const colorClass = getScoreColor(score)
  const textColor = colorClass.split(' ')[0]
  const bgColor = colorClass.split(' ')[1]

  return (
    <div className="flex items-center gap-4 w-full">
      <div className={cn(
        "font-display shrink-0",
        size === 'md' ? "text-[28px]" : "text-[18px]",
        textColor
      )}>
        {score}
      </div>
      
      <div className="flex-1">
        <div className={cn(
          "bg-border w-full overflow-hidden",
          size === 'md' ? "h-2.5 rounded-[5px]" : "h-1.5 rounded-[3px]"
        )}>
          <div 
            className={cn("h-full transition-all duration-600 ease-out", bgColor)}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </div>
      </div>

      {showLabel && (
        <div className={cn("text-xs font-body shrink-0", textColor)}>
          {getStanding(score)}
        </div>
      )}
    </div>
  )
}
