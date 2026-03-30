'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStudent } from '@/hooks/useStudents'
import StudentCard from '@/components/students/StudentCard'
import MedicalCardView from '@/components/students/MedicalCardView'
import StudentFeeHistoryCard from '@/components/finance/StudentFeeHistoryCard'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()

  const { data: student, isLoading, error } = useStudent(id)

  if (isLoading) return <LoadingSkeleton rows={8} cols={1} />
  if (error || !student) {
    // Redirect if student not found
    if (error) router.replace('/students')
    return <EmptyState message="Student not found." />
  }

  const roleAllowed = user && [
    UserRole.PRINCIPAL,
    UserRole.DEPUTY_PRINCIPAL,
    UserRole.ACCOUNTANT,
    UserRole.PARENT,
  ].includes(user.role)
  const isParentOwnChild = user?.role === UserRole.PARENT ? user.id === student.parent_id : true
  const showFeeHistory = !!roleAllowed && isParentOwnChild

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Students
      </Button>
      <div className="grid grid-cols-1 xl:grid-cols-[35%_35%_30%] gap-8">
        <div>
          <StudentCard student={student} />
        </div>
        <div>
          <MedicalCardView studentId={id} />
        </div>
        {showFeeHistory && (
          <div>
            <StudentFeeHistoryCard studentId={id} />
          </div>
        )}
      </div>
    </div>
  )
}
