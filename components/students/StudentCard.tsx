import { Student } from '@/types'
import RoleBadge from '@/components/shared/RoleBadge'

interface StudentCardProps {
  student: Student
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-surface-hover border-2 border-accent flex items-center justify-center text-accent font-display text-2xl">
          {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h1 className="font-display text-2xl text-text">{student.full_name}</h1>
          <p className="font-mono text-sm text-accent">{student.admission_number}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-text-muted">Form</span> <span className="text-text">{`${student.form.replace('_', ' ').toUpperCase()} ${student.stream}`}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Gender</span> <span className="text-text">{student.gender}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Date of Birth</span> <span className="text-text">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Emergency Contact</span> <span className="text-text">{student.emergency_contact || 'N/A'}</span></div>
      </div>
    </div>
  )
}
