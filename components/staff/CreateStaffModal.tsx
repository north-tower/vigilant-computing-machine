'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserRole, Form, Stream } from '@/types'
import { useCreateStaff } from '@/hooks/useStaff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import RoleBadge from '../shared/RoleBadge'

const staffSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  assigned_form: z.nativeEnum(Form).optional(),
  assigned_stream: z.nativeEnum(Stream).optional(),
  department: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type StaffFormData = z.infer<typeof staffSchema>

interface CreateStaffModalProps {
  onSuccess: () => void
}

export default function CreateStaffModal({ onSuccess }: CreateStaffModalProps) {
  const createMutation = useCreateStaff()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: UserRole.CLASS_TEACHER,
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: StaffFormData) => {
    try {
      const { confirmPassword, ...submitData } = data
      await createMutation.mutateAsync(submitData)
      toast.success(`Account created for ${data.full_name}`)
      onSuccess()
    } catch (err) {
      toast.error('Failed to create staff account')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="Jane Doe" {...register('full_name')} />
          {errors.full_name && <p className="text-[10px] text-danger font-bold uppercase">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" placeholder="jane.doe@sychar.ac.ke" {...register('email')} />
          {errors.email && <p className="text-[10px] text-danger font-bold uppercase">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...register('password')} />
          {errors.password && <p className="text-[10px] text-danger font-bold uppercase">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-[10px] text-danger font-bold uppercase">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>System Role</Label>
          <RoleBadge role={selectedRole} />
        </div>
        <select 
          {...register('role')}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        >
          {Object.values(UserRole).filter(r => r !== UserRole.PARENT).map(role => (
            <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {selectedRole === UserRole.CLASS_TEACHER && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label>Assigned Form</Label>
            <select {...register('assigned_form')} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm">
              {Object.values(Form).map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Assigned Stream</Label>
            <select {...register('assigned_stream')} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm">
              {Object.values(Stream).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {selectedRole === UserRole.HOD && (
        <div className="space-y-2 animate-in slide-in-from-top-2">
          <Label>Department Name</Label>
          <Input placeholder="e.g. Sciences" {...register('department')} />
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-accent text-bg font-bold h-12"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
      </Button>
    </form>
  )
}
