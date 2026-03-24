'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { PaymentMethod, Student, FeeStructure } from '@/types'
import { useStudents } from '@/hooks/useStudents'
import { useFeeStructures, useRecordPayment, useStudentBalance } from '@/hooks/useFinance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Search, X, Check, Smartphone, Banknote, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const paymentSchema = z.object({
  studentId: z.string().uuid('Please select a student'),
  feeStructureId: z.string().uuid('Please select a fee structure'),
  amount: z.number().positive('Amount must be greater than 0'),
  payment_method: z.nativeEnum(PaymentMethod),
  mpesa_receipt: z.string().optional(),
  mpesa_phone: z.string().optional(),
  transaction_date: z.string(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSuccess: () => void
  defaultStudentId?: string
  defaultFeeStructureId?: string
}

export default function PaymentForm({ onSuccess, defaultStudentId, defaultFeeStructureId }: PaymentFormProps) {
  const [searchTerm, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { data: students } = useStudents()
  const { data: feeStructures } = useFeeStructures()
  const recordMutation = useRecordPayment()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().slice(0, 16),
      payment_method: PaymentMethod.MPESA,
      studentId: defaultStudentId || '',
      feeStructureId: defaultFeeStructureId || '',
    }
  })

  const selectedStudentId = watch('studentId')
  const { data: balanceData } = useStudentBalance(selectedStudentId)
  const paymentMethod = watch('payment_method')

  useEffect(() => {
    if (defaultStudentId && students) {
      const student = students.find(s => s.id === defaultStudentId)
      if (student) setSelectedStudent(student)
    }
  }, [defaultStudentId, students])

  const filteredStudents = useMemo(() => {
    if (!searchTerm || selectedStudent) return []
    return (students || [])
      .filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 6)
  }, [students, searchTerm, selectedStudent])

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await recordMutation.mutateAsync(data)
      toast.success(`Payment of KES ${data.amount.toLocaleString('en-KE')} recorded`)
      reset()
      setSelectedStudent(null)
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Selection */}
      <div className="space-y-2 relative">
        <Label>Student</Label>
        {!selectedStudent ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Search student..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl z-20 overflow-hidden">
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
                      <div className="text-xs text-text-muted font-mono">{student.admission_number}</div>
                    </div>
                    <Check className="h-4 w-4 text-accent" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-bg border border-accent p-2.5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold uppercase">
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
              className="h-8 w-8"
              onClick={() => {
                setSelectedStudent(null)
                setValue('studentId', '')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Fee Structure */}
      <div className="space-y-2">
        <Label>Fee Structure</Label>
        <select 
          {...register('feeStructureId')}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select structure...</option>
          {feeStructures?.map(fs => (
            <option key={fs.id} value={fs.id}>
              {fs.form.replace('_', ' ').toUpperCase()} · {fs.term.replace('_', ' ')} · {fs.academic_year} · KES {fs.total_amount.toLocaleString('en-KE')}
            </option>
          ))}
        </select>
        {errors.feeStructureId && <p className="text-xs text-danger">{errors.feeStructureId.message}</p>}
      </div>

      {/* Amount & Balance */}
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input 
          type="number" 
          placeholder="Enter amount (KES)" 
          {...register('amount', { valueAsNumber: true })}
        />
        {balanceData && (
          <p className="text-xs font-medium text-amber">
            Remaining balance: KES {balanceData.balance.toLocaleString('en-KE')}
          </p>
        )}
        {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: PaymentMethod.MPESA, label: 'M-Pesa', icon: Smartphone },
            { id: PaymentMethod.CASH, label: 'Cash', icon: Banknote },
            { id: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer', icon: Landmark },
          ].map((method) => (
            <button
              key={method.id}
              type="button"
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2",
                paymentMethod === method.id 
                  ? "bg-accent/10 border-accent text-accent ring-1 ring-accent/20" 
                  : "bg-surface border-border text-text-muted hover:border-text-muted"
              )}
              onClick={() => setValue('payment_method', method.id)}
            >
              <method.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* M-Pesa Specific Fields */}
      {paymentMethod === PaymentMethod.MPESA && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <Label>M-Pesa Receipt</Label>
            <Input placeholder="e.g. QHX4KL2M3N" {...register('mpesa_receipt')} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="2547XXXXXXXX" {...register('mpesa_phone')} />
          </div>
        </div>
      )}

      {/* Transaction Date & Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Transaction Date</Label>
          <Input type="datetime-local" {...register('transaction_date')} />
        </div>
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea placeholder="..." rows={1} className="resize-none" {...register('notes')} />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90 text-bg font-bold h-11"
        disabled={recordMutation.isPending}
      >
        {recordMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          'Record Payment'
        )}
      </Button>
    </form>
  )
}
