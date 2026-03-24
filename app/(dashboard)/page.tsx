'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardRedirectPage() {
  const { redirectToDashboard, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard()
    }
  }, [isAuthenticated, redirectToDashboard])

  return null
}
