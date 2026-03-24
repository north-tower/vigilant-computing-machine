'use client'

import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import { format } from 'date-fns'

export default function PrincipalDashboard() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) return null

  return (
    <div>
      <PageHeader 
        title="Principal Dashboard" 
        subtitle={format(new Date(), 'EEEE, dd MMM yyyy')} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value="500" />
        <StatCard label="Total Staff" value="45" color="accent" />
        <StatCard label="Attendance Rate" value="94%" color="success" />
        <StatCard label="Revenue (MTD)" value="KES 1.2M" color="amber" />
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-text-muted">School analytics and financial overview coming in Phase 3.</p>
      </div>
    </div>
  )
}
