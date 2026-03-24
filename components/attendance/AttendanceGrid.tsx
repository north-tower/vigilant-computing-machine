import { useState, useEffect } from 'react'
import { Attendance, AttendanceStatus, Student } from '@/types'
import { useBulkMarkAttendance } from '@/hooks/useAttendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttendanceGridProps {
  students: Student[]
  existingRecords: Attendance[]
  date: string
  form: string
  stream: string
}

export default function AttendanceGrid({ students, existingRecords, date, form, stream }: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Map<string, { status: AttendanceStatus, remarks: string }>>(new Map())
  const { mutate, isPending, isSuccess } = useBulkMarkAttendance()

  useEffect(() => {
    const initialAttendance = new Map()
    students.forEach(student => {
      const record = (existingRecords || []).find(r => r.student?.id === student.id)
      initialAttendance.set(student.id, { 
        status: record?.status || '' as AttendanceStatus,
        remarks: record?.remarks || '',
      })
    })
    setAttendance(initialAttendance)
  }, [students, existingRecords])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => new Map(prev).set(studentId, { ...prev.get(studentId)!, status }))
  }

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendance(prev => new Map(prev).set(studentId, { ...prev.get(studentId)!, remarks }))
  }

  const handleSubmit = () => {
    const payload = Array.from(attendance.entries()).map(([studentId, { status, remarks }]) => ({ 
      studentId, 
      status, 
      remarks 
    }))
    mutate({ date, form, stream, entries: payload })
  }

  const summary = Array.from(attendance.values()).reduce((acc, { status }) => {
    if (status) acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<AttendanceStatus, number>)

  const allMarked = students.length > 0 && Array.from(attendance.values()).every(a => a.status)

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="divide-y divide-border">
        {students.map(student => (
          <div key={student.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">{student.full_name}</p>
                <p className="text-xs font-mono text-text-muted">{student.admission_number}</p>
              </div>
              <div className="flex gap-2">
                {(Object.keys(AttendanceStatus) as Array<keyof typeof AttendanceStatus>).map(statusKey => (
                  <Button 
                    key={statusKey} 
                    variant="outline"
                    size="icon"
                    onClick={() => handleStatusChange(student.id, AttendanceStatus[statusKey])}
                    className={cn(
                      'h-9 w-9',
                      attendance.get(student.id)?.status === AttendanceStatus[statusKey] && {
                        'PRESENT': 'bg-success/20 border-success text-success',
                        'ABSENT': 'bg-danger/20 border-danger text-danger',
                        'LATE': 'bg-amber/20 border-amber text-amber',
                        'EXCUSED': 'bg-purple-500/20 border-purple-500 text-purple-500',
                      }[AttendanceStatus[statusKey]]
                    )}
                  >
                    {AttendanceStatus[statusKey][0]}
                  </Button>
                ))}
              </div>
            </div>
            {(attendance.get(student.id)?.status === 'ABSENT' || attendance.get(student.id)?.status === 'LATE') && (
              <Input 
                placeholder="Add reason (optional)"
                value={attendance.get(student.id)?.remarks || ''}
                onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                className="mt-2 text-xs bg-bg border-border h-8"
              />
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-surface-hover border-t border-border p-4 flex items-center justify-between">
        <div className="text-xs text-text-muted font-medium">
          <span>{summary.PRESENT || 0} Present</span> ·
          <span> {summary.ABSENT || 0} Absent</span> ·
          <span> {summary.LATE || 0} Late</span> ·
          <span> {summary.EXCUSED || 0} Excused</span>
        </div>
        <Button onClick={handleSubmit} disabled={!allMarked || isPending || isSuccess} className="w-40">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <Check className="h-4 w-4" /> : 'Submit Attendance'}
        </Button>
      </div>
    </div>
  )
}
