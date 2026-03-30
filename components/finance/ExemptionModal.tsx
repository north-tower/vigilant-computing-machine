'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { StudentFeeAccount } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApplyExemption } from '@/hooks/useFinance'
import { toast } from 'sonner'

interface ExemptionModalProps {
  isOpen: boolean
  onClose: () => void
  account: StudentFeeAccount | null
}

const reasons = [
  'Government bursary',
  'School board waiver',
  'Orphan/vulnerable child',
  'Staff child discount',
  'Other (specify below)',
]

export default function ExemptionModal({ isOpen, onClose, account }: ExemptionModalProps) {
  const applyMutation = useApplyExemption()
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [inlineError, setInlineError] = useState('')

  useEffect(() => {
    if (!account) return
    setAmount(Number(account.exemption_amount))
    setReason(account.exemption_reason && reasons.includes(account.exemption_reason) ? account.exemption_reason : 'Other (specify below)')
    setOtherReason(account.exemption_reason && !reasons.includes(account.exemption_reason) ? account.exemption_reason : '')
    setInlineError('')
  }, [account])

  const effectiveReason = reason === 'Other (specify below)' ? otherReason : reason
  const effectiveBill = (account ? Number(account.billed_amount) : 0) - Number(amount || 0)
  const unchanged = account
    ? Number(amount) === Number(account.exemption_amount) && effectiveReason === (account.exemption_reason || '')
    : true

  const schema = useMemo(
    () =>
      z.object({
        amount: z.number().min(0).max(account ? Number(account.billed_amount) : 0),
        reason: z.string().min(3),
      }),
    [account],
  )

  if (!isOpen || !account) return null

  const submit = async () => {
    const parsed = schema.safeParse({ amount: Number(amount), reason: effectiveReason })
    if (!parsed.success) {
      setInlineError(parsed.error.issues[0]?.message || 'Validation failed')
      return
    }

    try {
      await applyMutation.mutateAsync({ id: account.id, amount: Number(amount), reason: effectiveReason })
      toast.success(`Exemption applied for ${account.student.full_name}`)
      onClose()
    } catch (err: any) {
      setInlineError(err?.response?.data?.message || 'Failed to apply exemption')
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Student</p>
        <p className="text-sm text-text">
        {account.student.full_name} · {account.student.form.replace('form_', 'Form ')}{account.student.stream}
        </p>
      </div>

      <div className="rounded-xl border border-border p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-text-muted">Billed amount</span>
          <span className="font-mono text-text">KES {Number(account.billed_amount).toLocaleString('en-KE')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Current exemption</span>
          <span className="font-mono text-success">KES {Number(account.exemption_amount).toLocaleString('en-KE')}</span>
        </div>
        <div className="border-t border-border pt-2 mt-1 flex justify-between font-medium">
          <span className="text-text">Effective bill</span>
          <span className="font-mono text-text">KES {Math.max(0, effectiveBill).toLocaleString('en-KE')}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Exemption Amount</label>
        <Input
          type="number"
          step="0.01"
          min={0}
          max={Number(account.billed_amount)}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value || 0))}
        />
        <p className="text-xs text-text-muted">
          New effective bill: KES {Math.max(0, effectiveBill).toLocaleString('en-KE')}
        </p>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Reason</label>
        <select
          className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select reason...</option>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {reason === 'Other (specify below)' && (
          <Input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Specify reason..." />
        )}
      </div>
      {inlineError && <p className="text-xs text-danger">{inlineError}</p>}
      <Button onClick={submit} disabled={unchanged || applyMutation.isLoading} className="w-full h-10 font-semibold">
        {applyMutation.isLoading ? 'Saving...' : 'Apply Exemption'}
      </Button>
    </div>
  )
}
