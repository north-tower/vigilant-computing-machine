'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import PageHeader from '@/components/shared/PageHeader'
import StudentFilterBar from '@/components/students/StudentFilterBar'
import StudentTable from '@/components/students/StudentTable'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { UserRole } from '@/types'

export default function StudentsPage() {
  const { user, isAuthenticated } = useAuth()
  const [filters, setFilters] = useState({
    form: '',
    stream: '',
    gender: '',
    search: '',
  })

  // Sync filters when user is available (for Class Teachers)
  useEffect(() => {
    if (user?.role === UserRole.CLASS_TEACHER && user.assigned_form && user.assigned_stream) {
      setFilters(prev => ({
        ...prev,
        form: user.assigned_form!,
        stream: user.assigned_stream!,
      }))
    }
  }, [user])

  const { data: students, isLoading, error } = useStudents({
    form: filters.form,
    stream: filters.stream,
    gender: filters.gender,
  })

  const filteredStudents = useMemo(() => {
    if (!students) return []
    return students.filter(s => 
      s.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(filters.search.toLowerCase())
    )
  }, [students, filters.search])

  if (!isAuthenticated || !user) return null

  const canAddStudent = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.DEPUTY_PRINCIPAL

  return (
    <div>
      <PageHeader 
        title="Students" 
        action={canAddStudent && <Button disabled>Add Student</Button>}
      />

      {user?.role !== UserRole.CLASS_TEACHER && (
        <StudentFilterBar filters={filters} onFilterChange={setFilters} />
      )}

      {isLoading && <LoadingSkeleton rows={10} cols={5} />}
      {error && <EmptyState message="Failed to load students." />}
      {!isLoading && !error && filteredStudents.length === 0 && <EmptyState message="No students found." icon={Users} />}
      {!isLoading && !error && filteredStudents.length > 0 && <StudentTable students={filteredStudents} />}
    </div>
  )
}
