import { useRouter } from 'next/navigation'
import { Student } from '@/types'
import { cn } from '@/lib/utils'

interface StudentTableProps {
  students: Student[]
}

export default function StudentTable({ students }: StudentTableProps) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Admission No</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Full Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Form & Stream</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Gender</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {students.map((student) => (
            <tr key={student.id} onClick={() => router.push(`/students/${student.id}`)} className="hover:bg-surface-hover cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-accent">{student.admission_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{student.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{`${student.form.replace('_', ' ').toUpperCase()} ${student.stream}`}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                <div className="flex items-center">
                  <div className={cn('h-2 w-2 rounded-full mr-2', student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500')}></div>
                  {student.gender}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  student.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                )}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
