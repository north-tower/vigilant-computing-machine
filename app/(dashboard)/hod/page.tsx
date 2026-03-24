'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/shared/PageHeader'
import AttendanceRateBar from '@/components/attendance/AttendanceRateBar'
import GenderBreakdownCard from '@/components/attendance/GenderBreakdownCard'
import { format } from 'date-fns'

export default function HodDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  })

  // Mock data
  const attendanceRates = [
    { label: 'Form 1A', rate: 95, total: 30 },
    { label: 'Form 1B', rate: 88, total: 32 },
    { label: 'Form 2A', rate: 92, total: 28 },
    { label: 'Form 2B', rate: 74, total: 31 },
  ]
  const genderBreakdown = {
    male: { present: 120, absent: 5, late: 2, excused: 1, total: 128, rate: 93.75 },
    female: { present: 115, absent: 8, late: 3, excused: 0, total: 126, rate: 91.27 },
  }

  if (!isAuthenticated || !user) return null

  return (
    <div>
      <PageHeader title="Department Overview" subtitle={user?.department || ''} />

      <div className="flex items-center gap-4 mb-6">
        <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none" />
        <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-lg mb-4">Attendance Rates</h2>
          <div className="space-y-4">
            {attendanceRates.map(item => <AttendanceRateBar key={item.label} {...item} />)}
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg mb-4">Gender Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GenderBreakdownCard gender="male" data={genderBreakdown.male} />
            <GenderBreakdownCard gender="female" data={genderBreakdown.female} />
          </div>
        </div>
      </div>
    </div>
  )
}
