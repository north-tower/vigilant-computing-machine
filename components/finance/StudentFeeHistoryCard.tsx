'use client'

import { useMemo } from 'react'
import { useStudentFeeHistory } from '@/hooks/useFinance'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import FeeAccountStatusBadge from './FeeAccountStatusBadge'
import ArrearsTag from './ArrearsTag'
import { cn } from '@/lib/utils'

interface StudentFeeHistoryCardProps {
  studentId: string
}

export default function StudentFeeHistoryCard({ studentId }: StudentFeeHistoryCardProps) {
  const { history, isLoading } = useStudentFeeHistory(studentId)
  const outstanding = useMemo(
    () => history.filter((h) => h.balance > 0).reduce((sum, h) => sum + Number(h.balance), 0),
    [history],
  )

  if (isLoading) return <LoadingSkeleton rows={3} cols={3} />
  if (!history.length) return <EmptyState message="No fee history found for this student" />

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px]">Fee History</h3>
        <span className={cn('text-xs px-2 py-1 rounded-full', outstanding > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success')}>
          {outstanding > 0 ? `KES ${outstanding.toLocaleString('en-KE')} outstanding` : 'All Clear'}
        </span>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const effectiveBill = Number(item.billed_amount) - Number(item.exemption_amount)
          const progress = effectiveBill > 0 ? Math.min(100, (Number(item.total_paid) / effectiveBill) * 100) : 100
          const balanceColor = item.balance === 0 ? 'text-success' : item.balance >= 5000 ? 'text-danger' : 'text-amber'
          return (
            <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm">{item.fee_structure.term.replace('_', ' ')} · {item.fee_structure.academic_year}</p>
                  <FeeAccountStatusBadge status={item.status} size="sm" />
                </div>
                <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden mt-2">
                  <div className={cn('h-full', item.balance === 0 ? 'bg-success' : 'bg-amber')} style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="text-sm">
                <p>Billed: <span className="font-mono">KES {Number(item.billed_amount).toLocaleString('en-KE')}</span></p>
                <p>Paid: <span className="font-mono text-accent">KES {Number(item.total_paid).toLocaleString('en-KE')}</span></p>
                <p>Balance: <span className={cn('font-mono', balanceColor)}>KES {Number(item.balance).toLocaleString('en-KE')}</span></p>
                <ArrearsTag amount={Number(item.arrears_brought_forward)} />
              </div>
              {Number(item.exemption_amount) > 0 && (
                <p className="text-[11px] text-text-muted italic">
                  Includes KES {Number(item.exemption_amount).toLocaleString('en-KE')} exemption — {item.exemption_reason}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
