'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import { useClassAttendance } from '@/hooks/useAttendance'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { UserRole } from '@/types'

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const today = format(new Date(), 'yyyy-MM-dd')
  
  const { data: students, isLoading: isLoadingStudents } = useStudents({
    form: user?.assigned_form || 'NONE',
    stream: user?.assigned_stream || 'NONE',
  })

  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useClassAttendance(
    user?.assigned_form || 'NONE',
    user?.assigned_stream || 'NONE',
    today
  )

  if (!isAuthenticated || !user) return null

  const isLoading = isLoadingStudents || isLoadingAttendance
  const attendanceMarked = attendanceRecords && attendanceRecords.length > 0
  const classSize = students?.length || 0
  const presentCount = attendanceRecords?.filter(r => r.status === 'PRESENT').length || 0
  const presentToday = attendanceMarked ? `${presentCount}/${classSize}` : "—"
  const openIncidents = 0 // Feature coming soon

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={1} cols={1} className="h-20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton rows={1} cols={1} className="h-32" />
          <LoadingSkeleton rows={1} cols={1} className="h-32" />
          <LoadingSkeleton rows={1} cols={1} className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title={`Good morning, ${user?.full_name.split(' ')[0]}`}
        subtitle={`Form ${(user?.assigned_form || '').replace('_','')} ${user?.assigned_stream || ''} · ${format(new Date(), 'EEEE, dd MMM yyyy')}`}
      />

      <div className={`p-4 rounded-lg mb-8 ${attendanceMarked ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{attendanceMarked ? `Attendance marked · ${presentToday}/${classSize} present` : 'Attendance not yet marked for today'}</p>
          </div>
          <Button onClick={() => router.push('/teacher/attendance')} className={!attendanceMarked ? 'bg-amber text-white' : ''}>
            {attendanceMarked ? 'View Attendance' : 'Mark Attendance Now'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Class Size" value={classSize} />
        <StatCard label="Present Today" value={presentToday} />
        <StatCard label="Open Incidents" value={openIncidents} color="danger" />
      </div>

      <div>
        <h2 className="font-display text-lg mb-4">Recent Discipline Incidents</h2>
        {/* Placeholder for incidents table */}
        <div className="bg-surface border border-border rounded-lg p-4 text-center text-sm text-text-muted">
          Discipline incidents will be shown here.
        </div>
      </div>
    </div>
  )
}
