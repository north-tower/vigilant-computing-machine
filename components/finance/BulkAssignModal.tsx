'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBulkAssignFees, useFeeStructures } from '@/hooks/useFinance'

interface BulkAssignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (feeStructureId: string) => void
}

type Step = 'configure' | 'confirm' | 'loading' | 'result'

export default function BulkAssignModal({ isOpen, onClose, onSuccess }: BulkAssignModalProps) {
  const [step, setStep] = useState<Step>('configure')
  const [feeStructureId, setFeeStructureId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { feeStructures } = useFeeStructures()
  const bulkAssign = useBulkAssignFees()
  const selected = useMemo(() => feeStructures.find((f) => f.id === feeStructureId), [feeStructures, feeStructureId])

  if (!isOpen) return null

  const runAssign = async () => {
    if (!selected) return
    setStep('loading')
    setError(null)
    try {
      const result = await bulkAssign.mutateAsync({ feeStructureId: selected.id })
      setStep('result')
      onSuccess?.(selected.id)
      return result
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to assign fee accounts')
      setStep('result')
    }
  }

  return (
    <div className="space-y-5">
      {step === 'configure' && (
        <>
          <div className="rounded-xl border border-amber/30 bg-amber/10 p-4 text-sm text-amber flex gap-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              This will create fee accounts for all active students in the selected form.
              Existing accounts are not affected.
            </p>
          </div>
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fee Structure</label>
            <select
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
              value={feeStructureId}
              onChange={(e) => setFeeStructureId(e.target.value)}
            >
              <option value="">Select fee structure...</option>
              {feeStructures.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.form.replace('form_', 'Form ')} · {fs.term.replace('_', ' ')} · {fs.academic_year} · KES {Number(fs.total_amount).toLocaleString('en-KE')}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-1 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="min-w-24">Cancel</Button>
            <Button onClick={() => setStep('confirm')} disabled={!selected} className="min-w-32">Assign Fees →</Button>
          </div>
        </>
      )}

      {step === 'confirm' && selected && (
        <>
          <div className="rounded-xl border border-border p-4 text-sm space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Confirm Assignment</p>
            <p className="font-medium text-text">
              {selected.form.replace('form_', 'Form ')} · {selected.term.replace('_', ' ')} · {selected.academic_year}
            </p>
            <p className="font-mono text-text">KES {Number(selected.total_amount).toLocaleString('en-KE')}</p>
            <p className="text-text-muted leading-relaxed">
              Arrears will be automatically included from previous term.
            </p>
          </div>
          <div className="pt-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep('configure')} className="min-w-24">← Back</Button>
            <Button onClick={runAssign} className="min-w-36">Confirm Assignment</Button>
          </div>
        </>
      )}

      {step === 'loading' && (
        <div className="py-10 text-center text-sm text-text-muted">Assigning fee accounts...</div>
      )}

      {step === 'result' && (
        <div className="py-4 text-center space-y-4">
          {!error ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <p className="font-medium text-text">Fee assignment complete</p>
              <p className="text-sm text-text-muted">
                {bulkAssign.data?.created || 0} accounts created · {bulkAssign.data?.skipped || 0} skipped
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-danger mx-auto" />
              <p className="text-danger">{error}</p>
            </>
          )}
          <div className="pt-1 flex justify-center gap-2">
            {error && <Button variant="outline" onClick={() => setStep('configure')} className="min-w-24">Try Again</Button>}
            <Button onClick={onClose} className="min-w-24">Done</Button>
          </div>
        </div>
      )}
    </div>
  )
}
