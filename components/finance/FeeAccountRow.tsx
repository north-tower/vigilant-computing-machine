'use client'

import { useState } from 'react'
import { StudentFeeAccount, UserRole, FeeAccountStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import FeeAccountStatusBadge from './FeeAccountStatusBadge'
import ArrearsTag from './ArrearsTag'

interface FeeAccountRowProps {
  account: StudentFeeAccount
  onPay?: (account: StudentFeeAccount) => void
  onSTK?: (account: StudentFeeAccount) => void
  onExemption?: (account: StudentFeeAccount) => void
}

export default function FeeAccountRow({ account, onPay, onSTK, onExemption }: FeeAccountRowProps) {
  const [expanded, setExpanded] = useState(false)
  const { user } = useAuth()
  const hideActions = account.status === FeeAccountStatus.CLEARED || account.status === FeeAccountStatus.OVERPAID
  const canPay = user?.role === UserRole.ACCOUNTANT
  const canExempt = user?.role === UserRole.ACCOUNTANT || user?.role === UserRole.PRINCIPAL

  const balanceColor =
    account.balance === 0 ? 'text-success' : account.balance >= 5000 ? 'text-danger' : 'text-amber'

  return (
    <>
      <tr
        className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-5 py-3">
          <div className="font-medium text-text">{account.student.full_name}</div>
          <div className="text-[12px] text-text-muted font-mono">{account.student.admission_number}</div>
        </td>
        <td className="px-5 py-3 text-text-muted">
          {account.student.form.replace('form_', 'Form ')}{account.student.stream}
        </td>
        <td className="px-5 py-3 font-mono">
          KES {Number(account.billed_amount).toLocaleString('en-KE')}
          <div className="mt-1">
            <ArrearsTag amount={Number(account.arrears_brought_forward)} />
          </div>
        </td>
        <td
          className={cn(
            'px-5 py-3 font-mono',
            Number(account.exemption_amount) > 0 ? 'text-success' : 'text-text-muted',
          )}
          title={account.exemption_reason || undefined}
        >
          {Number(account.exemption_amount) > 0
            ? `KES ${Number(account.exemption_amount).toLocaleString('en-KE')}`
            : '—'}
        </td>
        <td className="px-5 py-3 font-mono text-accent">
          KES {Number(account.total_paid).toLocaleString('en-KE')}
        </td>
        <td className={cn('px-5 py-3 font-mono font-medium', balanceColor)}>
          {Number(account.balance) === 0
            ? 'Cleared'
            : `KES ${Number(account.balance).toLocaleString('en-KE')}`}
        </td>
        <td className="px-5 py-3">
          <FeeAccountStatusBadge status={account.status} />
        </td>
        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
          {!hideActions && (
            <div className="flex items-center gap-1">
              {canPay && (
                <>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => onPay?.(account)}>
                    <CreditCard className="h-3.5 w-3.5 mr-1" />Pay
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-success" onClick={() => onSTK?.(account)}>
                    <Smartphone className="h-3.5 w-3.5 mr-1" />STK
                  </Button>
                </>
              )}
              {canExempt && (
                <Button size="sm" variant="ghost" className="h-8 text-amber" onClick={() => onExemption?.(account)}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />Exempt
                </Button>
              )}
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="bg-surface-hover px-5 py-3 text-[13px] text-text-muted">
            <div className="flex flex-wrap gap-4">
              <span>Arrears brought forward: KES {Number(account.arrears_brought_forward).toLocaleString('en-KE')}</span>
              <span>Exemption reason: {account.exemption_reason || '—'}</span>
              <span>
                Last payment: {account.last_payment_at ? new Date(account.last_payment_at).toLocaleDateString('en-KE') : '—'}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
