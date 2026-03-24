'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStudent } from '@/hooks/useStudents'
import StudentCard from '@/components/students/StudentCard'
import MedicalCardView from '@/components/students/MedicalCardView'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: student, isLoading, error } = useStudent(id)

  if (isLoading) return <LoadingSkeleton rows={8} cols={1} />
  if (error || !student) {
    // Redirect if student not found
    if (error) router.replace('/students')
    return <EmptyState message="Student not found." />
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Students
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <StudentCard student={student} />
        </div>
        <div className="lg:col-span-2">
          <MedicalCardView studentId={id} />
        </div>
      </div>
    </div>
  )
}
