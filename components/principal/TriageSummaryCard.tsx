'use client'

import { Message, TriageLabel } from '@/types'
import { cn } from '@/lib/utils'

interface TriageSummaryCardProps {
  messages: Message[]
}

const triageConfig: Record<TriageLabel, { color: string; label: string }> = {
  [TriageLabel.EMERGENCY]: { color: 'bg-danger', label: 'Emergency' },
  [TriageLabel.FEE_QUERY]: { color: 'bg-amber', label: 'Fees' },
  [TriageLabel.ACADEMIC_CONCERN]: { color: 'bg-accent', label: 'Academic' },
  [TriageLabel.DISCIPLINARY]: { color: 'bg-purple-500', label: 'Discipline' },
  [TriageLabel.COMPLAINT]: { color: 'bg-orange-500', label: 'Complaint' },
  [TriageLabel.PRAISE]: { color: 'bg-success', label: 'Praise' },
  [TriageLabel.GENERAL_INQUIRY]: { color: 'bg-text-muted', label: 'General' },
}

export default function TriageSummaryCard({ messages }: TriageSummaryCardProps) {
  const classifiedMessages = messages.filter(m => m.triage_label !== null)
  const total = classifiedMessages.length

  if (classifiedMessages.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-sm text-amber font-medium">Awaiting AI classification</p>
        <p className="text-xs text-text-faint">Smart message triaging will appear here as parent messages arrive.</p>
      </div>
    )
  }

  const counts = classifiedMessages.reduce((acc, msg) => {
    const label = msg.triage_label as TriageLabel
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {} as Record<TriageLabel, number>)

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-[2px]">
        {Object.entries(counts).map(([label, count]) => (
          <div
            key={label}
            className={cn("h-full transition-all duration-700 ease-out", triageConfig[label as TriageLabel].color)}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {Object.entries(counts).map(([label, count]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", triageConfig[label as TriageLabel].color)} />
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
              {triageConfig[label as TriageLabel].label}: {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
