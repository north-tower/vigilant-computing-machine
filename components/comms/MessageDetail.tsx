'use client'

import { Message, TriageLabel } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import PriorityBadge from './PriorityBadge'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useMarkAsRead, useSendMessage } from '@/hooks/useComms'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'

interface MessageDetailProps {
  message: Message | null
  onClose?: () => void
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

export default function MessageDetail({ message, onClose }: MessageDetailProps) {
  const markAsReadMutation = useMarkAsRead()
  const sendMessageMutation = useSendMessage()
  const [replyBody, setReplyBody] = useState('')
  const [isReplyOpen, setIsReplyOpen] = useState(false)

  useEffect(() => {
    if (message && !message.is_read) {
      markAsReadMutation.mutate(message.id)
    }
  }, [message?.id])

  const handleSendReply = async () => {
    if (!message || !replyBody.trim()) return

    try {
      await sendMessageMutation.mutateAsync({
        subject: `Re: ${message.subject}`,
        body: replyBody,
        priority: message.priority,
        recipientId: message.sender.id,
      })
      toast.success('Reply sent')
      setReplyBody('')
      setIsReplyOpen(false)
    } catch (err) {
      toast.error('Failed to send reply')
    }
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-text-faint">
          <MessageSquare className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg text-text">Select a message to read</h3>
          <p className="text-sm text-text-muted">Choose a conversation from the list to view details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="md:hidden text-text-muted hover:text-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-display text-2xl text-text leading-tight">{message.subject}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-dim flex items-center justify-center text-accent font-bold text-xs uppercase">
              {message.sender.full_name[0]}
            </div>
            <span className="text-sm font-medium text-text">{message.sender.full_name}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-text-faint" />
          <PriorityBadge priority={message.priority} size="sm" />
          <div className="w-1 h-1 rounded-full bg-text-faint" />
          <span className="text-[11px] text-text-muted font-mono uppercase tracking-wider">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        {message.triage_label && message.triage_confidence && message.triage_confidence > 0.6 && (
          <div className="flex items-center gap-2 p-3 bg-surface/50 border border-border rounded-lg">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
              triageConfig[message.triage_label]
            )}>
              {message.triage_label.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-text-muted">
              Auto-classified with {Math.round(message.triage_confidence * 100)}% confidence
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-prose mx-auto space-y-8">
          <p className="text-[15px] leading-relaxed text-text font-body whitespace-pre-wrap">
            {message.body}
          </p>

          {isReplyOpen ? (
            <div className="pt-8 border-t border-border space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Compose Reply</h3>
                <button 
                  onClick={() => setIsReplyOpen(false)}
                  className="text-[10px] font-bold uppercase text-text-faint hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </div>
              <Textarea 
                placeholder="Write your reply..." 
                rows={5}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="bg-surface border-border focus:ring-accent"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendReply}
                  disabled={!replyBody.trim() || sendMessageMutation.isPending}
                  className="bg-accent text-bg font-bold h-10 px-6 flex items-center gap-2"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-8 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setIsReplyOpen(true)}
                className="border-accent text-accent hover:bg-accent/10 font-bold px-8"
              >
                Reply to Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 px-6 border-top border-border">
        {message.is_read && message.read_at && (
          <span className="text-[11px] text-text-faint font-mono uppercase tracking-wider">
            Read {format(new Date(message.read_at), 'dd MMM yyyy, HH:mm')}
          </span>
        )}
      </div>
    </div>
  )
}
