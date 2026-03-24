'use client'

import { useAuth } from '@/hooks/useAuth'
import { useInbox } from '@/hooks/useComms'
import { UserRole } from '@/types'
import PageHeader from '@/components/shared/PageHeader'
import MessageInbox from '@/components/comms/MessageInbox'
import MessageComposer from '@/components/comms/MessageComposer'
import { redirect } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CommsContent() {
  const { user, isAuthenticated } = useAuth()
  const { unreadCount } = useInbox()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  if (!isAuthenticated || !user) return null

  if (user.role !== UserRole.PRINCIPAL && user.role !== UserRole.PARENT) {
    redirect('/')
  }

  const isPrincipal = user.role === UserRole.PRINCIPAL

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title={isPrincipal ? "Communications" : "Message Principal"}
        subtitle={isPrincipal ? "Manage incoming parent inquiries and alerts" : "Send a secure message directly to the school principal"}
        action={
          isPrincipal && unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 border border-danger/20">
              <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              <span className="text-[10px] font-bold text-danger uppercase tracking-wider">{unreadCount} Unread Messages</span>
            </div>
          )
        }
      />

      {isPrincipal ? <MessageInbox /> : <MessageComposer />}
    </div>
  )
}

export default function CommsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommsContent />
    </Suspense>
  )
}
