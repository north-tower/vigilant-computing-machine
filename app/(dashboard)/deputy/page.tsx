'use client'

import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import AttendanceRateBar from '@/components/attendance/AttendanceRateBar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

import { useAuth } from '@/hooks/useAuth'

export default function DeputyDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Mock data
  const totalStudents = 500
  const presentToday = 92.5
  const openIncidents = 12
  const escalatedIncidents = 2
  const formAttendance = {
    'Form 1': [{ label: '1A', rate: 95, total: 30 }, { label: '1B', rate: 88, total: 32 }],
    'Form 2': [{ label: '2A', rate: 92, total: 28 }, { label: '2B', rate: 74, total: 31 }],
  }

  if (!isAuthenticated || !user) return null

  return (
    <div>
      <PageHeader title="Deputy Principal" subtitle={format(new Date(), 'EEEE, dd MMM yyyy')} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value={totalStudents} />
        <StatCard label="Present Today" value={`${presentToday}%`} color="success" />
        <StatCard label="Open Incidents" value={openIncidents} color="amber" />
        <StatCard label="Escalated Incidents" value={escalatedIncidents} color="danger" />
      </div>

      <div className="mb-8">
        <h2 className="font-display text-lg mb-4">School-Wide Attendance</h2>
        <div className="space-y-6">
          {Object.entries(formAttendance).map(([form, classes]) => (
            <div key={form}>
              <h3 className="font-display text-base mb-2">{form}</h3>
              <div className="space-y-2">
                {classes.map(c => <AttendanceRateBar key={c.label} {...c} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => router.push('/discipline')}>View Open Incidents</Button>
          <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => router.push('/teacher/attendance')}>Attendance Reports</Button>
        </div>
      </div>
    </div>
  )
}
