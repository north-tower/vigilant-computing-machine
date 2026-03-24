'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import PageHeader from '@/components/shared/PageHeader'
import StudentFilterBar from '@/components/students/StudentFilterBar'
import StudentTable from '@/components/students/StudentTable'
import StudentForm from '@/components/students/StudentForm'
import LinkChildForm from '@/components/students/LinkChildForm'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Users, Plus, Link as LinkIcon } from 'lucide-react'
import { UserRole } from '@/types'

export default function StudentsPage() {
  const { user, isAuthenticated } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
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
  const isParent = user?.role === UserRole.PARENT

  return (
    <div className="page-container">
      <PageHeader 
        title={isParent ? "My Child" : "Students"} 
        action={
          <>
            {canAddStudent && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-accent text-bg font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
            {isParent && (
              <Button 
                onClick={() => setIsLinkModalOpen(true)}
                className="bg-accent text-bg font-bold"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Link Child
              </Button>
            )}
          </>
        }
      />

      {!isParent && user?.role !== UserRole.CLASS_TEACHER && (
        <StudentFilterBar filters={filters} onFilterChange={setFilters} />
      )}

      {isLoading && <LoadingSkeleton rows={10} cols={5} />}
      {error && <EmptyState message="Failed to load students." />}
      {!isLoading && !error && filteredStudents.length === 0 && (
        <div className="py-12">
          <EmptyState 
            message={isParent ? "No child linked to your account yet." : "No students found."} 
            subMessage={isParent ? "Click 'Link Child' above to connect your child's record using their admission number." : undefined}
            icon={Users} 
          />
        </div>
      )}
      {!isLoading && !error && filteredStudents.length > 0 && <StudentTable students={filteredStudents} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student"
        width={600}
      >
        <StudentForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link Child to Account"
        width={480}
      >
        <LinkChildForm onSuccess={() => setIsLinkModalOpen(false)} />
      </Modal>
    </div>
  )
}
