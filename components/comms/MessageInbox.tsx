'use client'

import { useState } from 'react'
import { useInbox } from '@/hooks/useComms'
import { Message, MessagePriority } from '@/types'
import MessageList from './MessageList'
import MessageDetail from './MessageDetail'
import { cn } from '@/lib/utils'

export default function MessageInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFilter, setActiveFilter] = useState<'ALL' | MessagePriority | 'UNREAD'>('ALL')
  const [showDetail, setShowDetail] = useState(false)

  const filters = {
    priority: activeFilter !== 'ALL' && activeFilter !== 'UNREAD' ? activeFilter as MessagePriority : undefined,
    is_read: activeFilter === 'UNREAD' ? false : undefined,
  }

  const { data: messages, isLoading, unreadCount } = useInbox(filters)

  const handleSelect = (message: Message) => {
    setSelectedMessage(message)
    setShowDetail(true)
  }

  const handleClose = () => {
    setShowDetail(false)
  }

  const filterTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Urgent', value: MessagePriority.URGENT },
    { label: 'Financial', value: MessagePriority.FINANCIAL },
    { label: 'Academic', value: MessagePriority.ACADEMIC },
    { label: 'Unread', value: 'UNREAD' },
  ]

  return (
    <div className="flex h-[calc(100vh-120px)] border border-border rounded-xl overflow-hidden bg-surface">
      {/* Left Panel */}
      <div className={cn(
        "flex flex-col w-full md:w-[360px] border-r border-border bg-surface shrink-0",
        showDetail && "hidden md:flex"
      )}>
        <div className="p-6 pb-2 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text">Inbox</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent text-bg text-[10px] font-bold">
                {unreadCount} NEW
              </span>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value as any)}
                className={cn(
                  "pb-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all relative",
                  activeFilter === tab.value 
                    ? "text-accent" 
                    : "text-text-muted hover:text-text"
                )}
              >
                {tab.label}
                {activeFilter === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-bg/30">
          <MessageList 
            messages={messages || []} 
            selectedId={selectedMessage?.id || null} 
            onSelect={handleSelect} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className={cn(
        "flex-1 flex flex-col bg-bg",
        !showDetail && "hidden md:flex"
      )}>
        <MessageDetail message={selectedMessage} onClose={handleClose} />
      </div>
    </div>
  )
}
