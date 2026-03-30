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
    <div className="space-y-4">
      {step === 'configure' && (
        <>
          <div className="rounded-lg border border-amber bg-amber/10 p-3 text-sm text-amber flex gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <p>This will create fee accounts for all active students in the selected form. Existing accounts are not affected.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-muted">Fee Structure</label>
            <select
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => setStep('confirm')} disabled={!selected}>Assign Fees →</Button>
          </div>
        </>
      )}

      {step === 'confirm' && selected && (
        <>
          <div className="rounded-lg border border-border p-4 text-sm">
            <p className="font-medium text-text mb-1">Confirm Assignment</p>
            <p>{selected.form.replace('form_', 'Form ')} · {selected.term.replace('_', ' ')} · {selected.academic_year}</p>
            <p className="font-mono">KES {Number(selected.total_amount).toLocaleString('en-KE')}</p>
            <p className="mt-2 text-text-muted">Arrears will be automatically included from previous term.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep('configure')}>← Back</Button>
            <Button onClick={runAssign}>Confirm Assignment</Button>
          </div>
        </>
      )}

      {step === 'loading' && <div className="py-8 text-center text-text-muted">Assigning fee accounts...</div>}

      {step === 'result' && (
        <div className="py-4 text-center space-y-3">
          {!error ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <p className="font-medium">Fee assignment complete</p>
              <p className="text-sm text-text-muted">{bulkAssign.data?.created || 0} accounts created · {bulkAssign.data?.skipped || 0} skipped</p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-danger mx-auto" />
              <p className="text-danger">{error}</p>
            </>
          )}
          <div className="flex justify-center gap-2">
            {error && <Button variant="outline" onClick={() => setStep('configure')}>Try Again</Button>}
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </div>
  )
}
