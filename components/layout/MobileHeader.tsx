'use client'

import { useAuth } from '@/hooks/useAuth'
import { useInbox } from '@/hooks/useComms'
import { Menu, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user } = useAuth()
  const { unreadCount } = useInbox()

  if (!user) return null

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="text-text-muted hover:text-text"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex flex-col">
          <span className="font-display text-lg text-accent leading-none">Sychar</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-faint">CoPilot</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {unreadCount > 0 && (
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-text-muted" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
              {unreadCount}
            </span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center text-accent font-bold text-xs uppercase">
          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
    </header>
  )
}
