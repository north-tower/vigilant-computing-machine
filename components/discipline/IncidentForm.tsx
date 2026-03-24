'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { IncidentType, Severity, Student } from '@/types'
import { useStudents } from '@/hooks/useStudents'
import { useReportIncident } from '@/hooks/useDiscipline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Search, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const incidentSchema = z.object({
  studentId: z.string().uuid('Please select a student'),
  incident_type: z.nativeEnum(IncidentType),
  severity: z.nativeEnum(Severity),
  incident_date: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  action_taken: z.string().optional(),
})

type IncidentFormData = z.infer<typeof incidentSchema>

interface IncidentFormProps {
  onSuccess: () => void
  defaultStudentId?: string
}

export default function IncidentForm({ onSuccess, defaultStudentId }: IncidentFormProps) {
  const [searchTerm, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { data: students } = useStudents()
  const reportMutation = useReportIncident()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: new Date().toISOString().split('T')[0],
      incident_type: IncidentType.MISCONDUCT,
      severity: Severity.LOW,
      studentId: defaultStudentId || '',
    }
  })

  const filteredStudents = useMemo(() => {
    if (!searchTerm || selectedStudent) return []
    return (students || [])
      .filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 6)
  }, [students, searchTerm, selectedStudent])

  const onSubmit = async (data: IncidentFormData) => {
    try {
      await reportMutation.mutateAsync(data)
      toast.success('Incident reported successfully')
      reset()
      setSelectedStudent(null)
      setSearch('')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to report incident')
    }
  }

  const descriptionValue = watch('description') || ''

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Student Search */}
      <div className="space-y-2 relative">
        <Label>Student</Label>
        {!selectedStudent ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Search by name or admission number..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl z-10 overflow-hidden">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover flex items-center justify-between border-b border-border last:border-0"
                    onClick={() => {
                      setSelectedStudent(student)
                      setValue('studentId', student.id)
                      setSearch('')
                    }}
                  >
                    <div>
                      <div className="font-medium text-text">{student.full_name}</div>
                      <div className="text-xs text-text-muted font-mono">{student.admission_number} · {student.form.replace('_', ' ')} {student.stream}</div>
                    </div>
                    <Check className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-bg border border-accent p-2.5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                {selectedStudent.full_name[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-text">{selectedStudent.full_name}</div>
                <div className="text-xs text-text-muted font-mono">{selectedStudent.admission_number}</div>
              </div>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-text-muted hover:text-danger"
              onClick={() => {
                setSelectedStudent(null)
                setValue('studentId', '')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {errors.studentId && <p className="text-xs text-danger">{errors.studentId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Incident Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <select 
            {...register('incident_type')}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent outline-none"
          >
            {Object.values(IncidentType).map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label>Severity</Label>
          <select 
            {...register('severity')}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent outline-none"
          >
            <option value={Severity.LOW}>Low</option>
            <option value={Severity.MEDIUM}>Medium</option>
            <option value={Severity.HIGH}>High</option>
            <option value={Severity.CRITICAL}>Critical</option>
          </select>
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date of Incident</Label>
        <Input 
          type="date" 
          max={new Date().toISOString().split('T')[0]} 
          {...register('incident_date')}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          placeholder="What happened? Be specific..." 
          rows={4}
          {...register('description')}
        />
        <div className="flex justify-between text-[10px] text-text-muted px-1">
          <span>{errors.description?.message}</span>
          <span className={cn(descriptionValue.length > 500 && "text-danger")}>
            {descriptionValue.length} / 500
          </span>
        </div>
      </div>

      {/* Action Taken */}
      <div className="space-y-2">
        <Label>Action Taken (Optional)</Label>
        <Textarea 
          placeholder="Describe initial action taken..." 
          rows={2}
          {...register('action_taken')}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90 text-bg font-bold h-11"
        disabled={reportMutation.isPending}
      >
        {reportMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reporting...
          </>
        ) : (
          'Report Incident'
        )}
      </Button>
    </form>
  )
}
