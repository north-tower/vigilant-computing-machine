'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MpesaStatus, Student, FeeAccountStatus } from '@/types'
import { useStudents } from '@/hooks/useStudents'
import { useInitiateSTKPush, useTransactionStatus, useStudentFeeHistory } from '@/hooks/useFinance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, X, Check, Smartphone, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ArrearsTag from './ArrearsTag'

type STKState = 'FORM' | 'WAITING' | 'RESULT'

const stkSchema = z.object({
  studentId: z.string().uuid('Please select a student'),
  feeAccountId: z.string().uuid('Please select a fee account'),
  amount: z.number().positive('Amount must be positive'),
  phone: z.string().regex(/^2547\d{8}$/, 'Invalid phone number (must be 2547XXXXXXXX)'),
})

type STKFormData = z.infer<typeof stkSchema>

interface MpesaSTKModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStudentId?: string
}

export default function MpesaSTKModal({ isOpen, onClose, defaultStudentId }: MpesaSTKModalProps) {
  const [stkState, setStkState] = useState<STKState>('FORM')
  const [searchTerm, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)

  const { data: students } = useStudents()
  const { history } = useStudentFeeHistory(selectedStudent?.id || '')
  const initiateMutation = useInitiateSTKPush()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<STKFormData>({
    resolver: zodResolver(stkSchema),
    defaultValues: {
      studentId: defaultStudentId || '',
    }
  })

  const selectedAccountId = watch('feeAccountId')
  const selectedAccount = useMemo(() => history.find((a) => a.id === selectedAccountId), [history, selectedAccountId])

  const { data: transaction } = useTransactionStatus(
    checkoutRequestId || '',
    stkState === 'WAITING'
  )

  useEffect(() => {
    if (defaultStudentId && students) {
      const student = students.find(s => s.id === defaultStudentId)
      if (student) setSelectedStudent(student)
    }
  }, [defaultStudentId, students])

  useEffect(() => {
    if (stkState === 'WAITING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
    if (timeLeft === 0 && stkState === 'WAITING') {
      setStkState('RESULT')
    }
  }, [stkState, timeLeft])

  useEffect(() => {
    if (transaction?.status === MpesaStatus.SUCCESS || 
        transaction?.status === MpesaStatus.FAILED || 
        transaction?.status === MpesaStatus.CANCELLED) {
      setStkState('RESULT')
    }
  }, [transaction])

  const filteredStudents = useMemo(() => {
    if (!searchTerm || selectedStudent) return []
    return (students || [])
      .filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 6)
  }, [students, searchTerm, selectedStudent])

  const onSubmit = async (data: STKFormData) => {
    try {
      const result = await initiateMutation.mutateAsync({
        studentId: data.studentId,
        amount: data.amount,
        phone_number: data.phone,
      })
      setCheckoutRequestId(result.checkout_request_id)
      setStkState('WAITING')
      setTimeLeft(60)
    } catch (err: any) {
      toast.error('Failed to initiate STK Push')
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl z-20">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover border-b border-border last:border-0"
                    onClick={() => {
                      setSelectedStudent(student)
                      setValue('studentId', student.id)
                      setSearch('')
                    }}
                  >
                    <div className="font-medium text-text">{student.full_name}</div>
                    <div className="text-xs text-text-muted font-mono">{student.admission_number}</div>
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
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedStudent(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Fee Account</Label>
        <select 
          {...register('feeAccountId')}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select account...</option>
          {history
            .filter((acc) => showAllAccounts || acc.status !== FeeAccountStatus.CLEARED)
            .map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.fee_structure.term.replace('_', ' ')} · {acc.fee_structure.academic_year} · Balance: KES {Number(acc.balance).toLocaleString('en-KE')}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-xs text-text-muted">
          <input type="checkbox" checked={showAllAccounts} onChange={(e) => setShowAllAccounts(e.target.checked)} />
          Show all accounts
        </label>
        {errors.feeAccountId && <p className="text-xs text-danger">{errors.feeAccountId.message}</p>}
      </div>

      {selectedAccount && (
        <div className="rounded-lg border border-border p-3 text-xs space-y-1">
          <p>Balance: <span className="font-mono">KES {Number(selectedAccount.balance).toLocaleString('en-KE')}</span></p>
          <ArrearsTag amount={Number(selectedAccount.arrears_brought_forward)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" placeholder="KES" max={selectedAccount ? Number(selectedAccount.balance) : undefined} {...register('amount', { valueAsNumber: true })} />
          {selectedAccount && <p className="text-[10px] text-amber">Balance: KES {Number(selectedAccount.balance).toLocaleString('en-KE')}</p>}
          {selectedAccount && (
            <Button type="button" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setValue('amount', Number(selectedAccount.balance))}>
              Pay full
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <Label>M-Pesa Phone</Label>
          <Input placeholder="2547XXXXXXXX" {...register('phone')} />
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#3FB53F] hover:bg-[#3FB53F]/90 text-white font-bold h-11" disabled={initiateMutation.isPending}>
        {initiateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
        Send STK Push
      </Button>
    </form>
  )

  const renderWaiting = () => (
    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#3FB53F]/10 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[#3FB53F] flex items-center justify-center text-white shadow-lg">
            <Smartphone className="h-8 w-8" />
          </div>
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-[#3FB53F] border-t-transparent animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-text">Waiting for Confirmation</h3>
        <p className="text-sm text-text-muted">Check your phone to complete the payment</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono text-text-muted">
        <Clock className="h-4 w-4" />
        Timing out in {timeLeft}s...
      </div>
      <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={onClose}>
        Cancel Request
      </Button>
    </div>
  )

  const renderResult = () => {
    const isSuccess = transaction?.status === MpesaStatus.SUCCESS
    const isTimeout = timeLeft === 0 && !transaction
    
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success scale-110 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-display text-success">Payment Confirmed</h3>
              <p className="text-xl font-mono text-text">KES {transaction?.amount.toLocaleString('en-KE')}</p>
            </div>
            <div className="text-xs space-y-1 font-mono text-text-muted">
              <p>Receipt: {transaction?.mpesa_receipt}</p>
              <p>{transaction?.student?.full_name}</p>
            </div>
            <Button className="w-full bg-accent text-bg font-bold" onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center text-danger animate-in zoom-in duration-500">
              <AlertCircle className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-danger">{isTimeout ? 'Request Timed Out' : 'Payment Failed'}</h3>
              <p className="text-sm text-text-muted max-w-xs mx-auto">
                {transaction?.result_desc || 'The payment request was not completed in time.'}
              </p>
            </div>
            <div className="flex gap-4 w-full pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStkState('FORM')}>Try Again</Button>
              <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={cn("transition-opacity duration-300", !isOpen && "opacity-0 pointer-events-none")}>
      {stkState === 'FORM' && renderForm()}
      {stkState === 'WAITING' && renderWaiting()}
      {stkState === 'RESULT' && renderResult()}
    </div>
  )
}
