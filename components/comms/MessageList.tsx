'use client'

import { Message, TriageLabel } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import PriorityBadge from './PriorityBadge'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { MessageSquare } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  selectedId: string | null
  onSelect: (message: Message) => void
  isLoading: boolean
}

const triageConfig = {
  [TriageLabel.EMERGENCY]: 'text-danger bg-danger-dim',
  [TriageLabel.FEE_QUERY]: 'text-amber bg-amber-dim',
  [TriageLabel.ACADEMIC_CONCERN]: 'text-accent bg-accent-dim',
  [TriageLabel.DISCIPLINARY]: 'text-purple-500 bg-purple-500/10',
  [TriageLabel.COMPLAINT]: 'text-orange-500 bg-orange-500/10',
  [TriageLabel.PRAISE]: 'text-success bg-success-dim',
  [TriageLabel.GENERAL_INQUIRY]: 'text-text-muted bg-surface',
}

export default function MessageList({ messages, selectedId, onSelect, isLoading }: MessageListProps) {
  if (isLoading) return <LoadingSkeleton rows={6} cols={1} />
  if (messages.length === 0) return <EmptyState message="No messages" icon={MessageSquare} />

  return (
    <div className="flex flex-col divide-y divide-border">
      {messages.map((message) => (
        <button
          key={message.id}
          onClick={() => onSelect(message)}
          className={cn(
            'flex flex-col gap-1 p-4 text-left transition-colors relative hover:bg-surface-hover',
            selectedId === message.id && 'bg-accent-dim border-l-4 border-l-accent'
          )}
        >
          {!message.is_read && (
            <div className="absolute top-1/2 left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
          
          <div className="flex items-center justify-between w-full gap-2">
            <span className={cn(
              'text-sm truncate',
              message.is_read ? 'font-normal text-text-muted' : 'font-medium text-text'
            )}>
              {message.sender.full_name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={message.priority} size="sm" />
              <span className="text-[10px] text-text-faint font-mono">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className={cn(
            'text-[13px] truncate',
            message.is_read ? 'text-text-faint' : 'text-text-muted'
          )}>
            {message.subject}
          </div>

          {message.triage_label && (
            <div className="mt-1">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                triageConfig[message.triage_label]
              )}>
                {message.triage_label.replace('_', ' ')}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
