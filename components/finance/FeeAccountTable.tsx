'use client'

import { useMemo, useState } from 'react'
import { StudentFeeAccount } from '@/types'
import { ArrowUpDown, CreditCard } from 'lucide-react'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import FeeAccountRow from './FeeAccountRow'

interface FeeAccountTableProps {
  accounts: StudentFeeAccount[]
  isLoading: boolean
  onPay?: (account: StudentFeeAccount) => void
  onSTK?: (account: StudentFeeAccount) => void
  onExemption?: (account: StudentFeeAccount) => void
}

type SortKey = 'student' | 'billed_amount' | 'exemption_amount' | 'total_paid' | 'balance'

export default function FeeAccountTable({
  accounts,
  isLoading,
  onPay,
  onSTK,
  onExemption,
}: FeeAccountTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'balance',
    direction: 'desc',
  })

  const sorted = useMemo(() => {
    const sortedAccounts = [...accounts]
    sortedAccounts.sort((a, b) => {
      if (sortConfig.key === 'student') {
        const comp = a.student.full_name.localeCompare(b.student.full_name)
        return sortConfig.direction === 'asc' ? comp : -comp
      }
      const left = Number(a[sortConfig.key])
      const right = Number(b[sortConfig.key])
      return sortConfig.direction === 'asc' ? left - right : right - left
    })
    return sortedAccounts
  }, [accounts, sortConfig])

  const totals = useMemo(
    () =>
      sorted.reduce(
        (acc, curr) => ({
          billed: acc.billed + Number(curr.billed_amount),
          exempt: acc.exempt + Number(curr.exemption_amount),
          paid: acc.paid + Number(curr.total_paid),
          balance: acc.balance + Number(curr.balance),
        }),
        { billed: 0, exempt: 0, paid: 0, balance: 0 },
      ),
    [sorted],
  )

  const toggleSort = (key: SortKey) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))

  if (isLoading) return <LoadingSkeleton rows={8} cols={7} />
  if (!accounts.length) {
    return (
      <EmptyState
        message="No fee accounts found. Run bulk assignment first."
        icon={CreditCard}
      />
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-5 py-3 cursor-pointer" onClick={() => toggleSort('student')}>
                <span className="inline-flex items-center gap-2">Student <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3">Form/Stream</th>
              <th className="px-5 py-3 cursor-pointer" onClick={() => toggleSort('billed_amount')}>
                <span className="inline-flex items-center gap-2">Billed <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3 cursor-pointer" onClick={() => toggleSort('exemption_amount')}>
                <span className="inline-flex items-center gap-2">Exemption <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3 cursor-pointer" onClick={() => toggleSort('total_paid')}>
                <span className="inline-flex items-center gap-2">Paid <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3 cursor-pointer" onClick={() => toggleSort('balance')}>
                <span className="inline-flex items-center gap-2">Balance <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((account) => (
              <FeeAccountRow
                key={account.id}
                account={account}
                onPay={onPay}
                onSTK={onSTK}
                onExemption={onExemption}
              />
            ))}
          </tbody>
          <tfoot className="border-t border-border">
            <tr className="font-medium">
              <td className="px-5 py-3">Total</td>
              <td className="px-5 py-3">—</td>
              <td className="px-5 py-3 font-mono">KES {totals.billed.toLocaleString('en-KE')}</td>
              <td className="px-5 py-3 font-mono">KES {totals.exempt.toLocaleString('en-KE')}</td>
              <td className="px-5 py-3 font-mono">KES {totals.paid.toLocaleString('en-KE')}</td>
              <td className="px-5 py-3 font-mono">KES {totals.balance.toLocaleString('en-KE')}</td>
              <td className="px-5 py-3">—</td>
              <td className="px-5 py-3">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
