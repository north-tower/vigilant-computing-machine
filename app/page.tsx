'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const { isAuthenticated, redirectToDashboard } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard()
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, redirectToDashboard, router])

  return (
    <div className="min-h-screen bg-[#0D0F12]" />
  )
}
