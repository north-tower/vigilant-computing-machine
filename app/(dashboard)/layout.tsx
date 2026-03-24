'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'
import { Toaster } from 'sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Wait for hydration to check auth state reliably from local storage
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isHydrated, isAuthenticated, router])

  if (!isHydrated || !isAuthenticated) {
    return <div className="min-h-screen bg-[#0D0F12]" />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0F12]">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[40] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 md:mt-0">
          {children}
        </div>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </main>
    </div>
  )
}
