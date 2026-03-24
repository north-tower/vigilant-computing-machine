'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLinkChild } from '@/hooks/useStudents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Link as LinkIcon } from 'lucide-react'

const linkSchema = z.object({
  admission_number: z.string().min(3, 'Admission number is required'),
})

type LinkFormData = z.infer<typeof linkSchema>

interface LinkChildFormProps {
  onSuccess: () => void
}

export default function LinkChildForm({ onSuccess }: LinkChildFormProps) {
  const linkMutation = useLinkChild()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  })

  const onSubmit = async (data: LinkFormData) => {
    try {
      await linkMutation.mutateAsync(data.admission_number)
      toast.success('Child linked successfully')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to link child. Please check the admission number.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Child's Admission Number</Label>
        <Input 
          placeholder="e.g. ADM001" 
          {...register('admission_number')} 
          className="uppercase"
        />
        <p className="text-[11px] text-text-faint">
          Enter the unique admission number provided by the school to link your child's record to your account.
        </p>
        {errors.admission_number && <p className="text-xs text-danger font-medium">{errors.admission_number.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent text-bg font-bold h-12 flex items-center justify-center gap-2"
        disabled={linkMutation.isPending}
      >
        {linkMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            Link Child Account
          </>
        )}
      </Button>
    </form>
  )
}
