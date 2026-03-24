'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClassAttendance } from '@/hooks/useAttendance'
import { useStudents } from '@/hooks/useStudents'
import PageHeader from '@/components/shared/PageHeader'
import AttendanceGrid from '@/components/attendance/AttendanceGrid'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { format, addDays, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { UserRole, Form, Stream } from '@/types'

export default function AttendancePage() {
  const { user, isAuthenticated } = useAuth()
  const [date, setDate] = useState(new Date())
  const [overrideClass, setOverrideClass] = useState<{ form: Form; stream: Stream } | null>(null)

  // Derived class selection
  const selectedClass = useMemo(() => {
    if (user?.role === UserRole.CLASS_TEACHER && !overrideClass) {
      return {
        form: (user.assigned_form || Form.FORM_1) as Form,
        stream: (user.assigned_stream || Stream.A) as Stream,
      }
    }
    return overrideClass || { form: Form.FORM_1, stream: Stream.A }
  }, [user, overrideClass])

  const dateString = format(date, 'yyyy-MM-dd')

  const { data: students, isLoading: isLoadingStudents, isError: isErrorStudents } = useStudents(selectedClass)
  const { data: attendanceRecords, isLoading: isLoadingAttendance, isError: isErrorAttendance } = useClassAttendance(
    selectedClass.form, 
    selectedClass.stream, 
    dateString
  )

  useEffect(() => {
    if (user) {
      console.log('Current User:', user)
      console.log('Selected Class:', selectedClass)
      console.log('Date:', dateString)
    }
  }, [user, selectedClass, dateString])

  useEffect(() => {
    if (students) console.log('Fetched Students:', students)
    if (attendanceRecords) console.log('Fetched Attendance Records:', attendanceRecords)
  }, [students, attendanceRecords])

  if (!isAuthenticated || !user) return null

  const isLoading = isLoadingStudents || isLoadingAttendance
  const isError = isErrorStudents || isErrorAttendance

  return (
    <div>
      <PageHeader title="Mark Attendance" />

      <div className="flex items-center justify-between mb-6 bg-surface p-2 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDate(subDays(date, 1))}><ArrowLeft className="h-4 w-4" /></Button>
          <input 
            type="date" 
            value={dateString}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
          />
          <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 1))}><ArrowRight className="h-4 w-4" /></Button>
        </div>
        {user?.role !== UserRole.CLASS_TEACHER && (
          <div className="flex items-center gap-2">
            <select 
              name="form" 
              value={selectedClass.form} 
              onChange={(e) => setOverrideClass({ ...selectedClass, form: e.target.value as Form })}
              className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
            >
              {Object.values(Form).map(f => <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>)}
            </select>
            <select 
              name="stream" 
              value={selectedClass.stream} 
              onChange={(e) => setOverrideClass({ ...selectedClass, stream: e.target.value as Stream })}
              className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
            >
              {Object.values(Stream).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <h2 className="font-display text-lg mb-4">
        {`${(selectedClass.form || '').replace('_', ' ')} ${selectedClass.stream || ''} - ${format(date, 'EEEE, dd MMM yyyy')}`}
      </h2>

      {isLoading && <LoadingSkeleton rows={15} cols={1} />}
      {isError && <EmptyState message="Failed to load attendance data. Please check your connection." />}
      {!isLoading && !isError && students && attendanceRecords && students.length > 0 && (
        <AttendanceGrid 
          students={students}
          existingRecords={attendanceRecords}
          date={dateString}
          form={selectedClass.form}
          stream={selectedClass.stream}
        />
      )}
      {!isLoading && !isError && students && students.length === 0 && (
        <EmptyState 
          message={`No students found for ${selectedClass.form.replace('_', ' ')} ${selectedClass.stream}. Please contact administration if this is incorrect.`} 
        />
      )}
    </div>
  )
}
