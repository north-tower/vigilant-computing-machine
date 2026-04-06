'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, Stream } from '@/types'
import { useCreateStudent } from '@/hooks/useStudents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const studentSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  admission_number: z.string().min(3, 'Admission number is required'),
  form: z.nativeEnum(Form),
  stream: z.nativeEnum(Stream),
  gender: z.enum(['male', 'female']),
  date_of_birth: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^(\+2547\d{8}|2547\d{8}|07\d{8})$/.test(val.trim()),
      'Use +2547XXXXXXXX, 2547XXXXXXXX, or 07XXXXXXXX',
    ),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  onSuccess: () => void
}

export default function StudentForm({ onSuccess }: StudentFormProps) {
  const createMutation = useCreateStudent()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      form: Form.FORM_1,
      stream: Stream.A,
      gender: 'male',
    }
  })

  const onSubmit = async (data: StudentFormData) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success(`Student ${data.full_name} added successfully`)
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add student')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="John Doe" {...register('full_name')} />
          {errors.full_name && <p className="text-xs text-danger">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Admission Number</Label>
          <Input placeholder="ADM001" {...register('admission_number')} />
          {errors.admission_number && <p className="text-xs text-danger">{errors.admission_number.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Form</Label>
          <select 
            {...register('form')}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {Object.values(Form).map(f => (
              <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Stream</Label>
          <select 
            {...register('stream')}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {Object.values(Stream).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <select 
            {...register('gender')}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input type="date" {...register('date_of_birth')} />
      </div>

      <div className="border border-border rounded-xl p-4 space-y-4">
        <p className="text-xs uppercase tracking-wider text-text-muted font-semibold">
          Parent (optional - auto link/create)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Parent Name</Label>
            <Input placeholder="Jane Parent" {...register('parent_name')} />
          </div>
          <div className="space-y-2">
            <Label>Parent Phone</Label>
            <Input placeholder="+254712345678" {...register('parent_phone')} />
            {errors.parent_phone && (
              <p className="text-xs text-danger">{errors.parent_phone.message}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-text-muted">
          If phone exists for a parent account, student will be linked. Otherwise a parent account
          is auto-created using this phone.
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent text-bg font-bold h-12"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Student'
        )}
      </Button>
    </form>
  )
}
