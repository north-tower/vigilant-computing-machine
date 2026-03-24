'use client'

import { useState } from 'react'
import { FeeBalanceSummary, UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, CreditCard, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'

interface FeeBalanceTableProps {
  balances: FeeBalanceSummary[]
  isLoading: boolean
  onPay?: (studentId: string, feeStructureId: string) => void
  onStkPush?: (studentId: string) => void
}

export default function FeeBalanceTable({ balances, isLoading, onPay, onStkPush }: FeeBalanceTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof FeeBalanceSummary; direction: 'asc' | 'desc' }>({
    key: 'balance',
    direction: 'desc'
  })
  const { user } = useAuth()

  const handleSort = (key: keyof FeeBalanceSummary) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    })
  }

  const sortedBalances = [...balances].sort((a, b) => {
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return 0
  })

  if (isLoading) return <LoadingSkeleton rows={6} cols={6} />
  if (balances.length === 0) return <EmptyState message="No fee balances found" />

  const totals = balances.reduce((acc, curr) => ({
    billed: acc.billed + curr.total_billed,
    paid: acc.paid + curr.total_paid,
    balance: acc.balance + curr.balance
  }), { billed: 0, paid: 0, balance: 0 })

  const isAccountant = user?.role === UserRole.ACCOUNTANT

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-6 py-4 font-medium text-text-muted cursor-pointer hover:text-text transition-colors" onClick={() => handleSort('student' as any)}>
                <div className="flex items-center gap-2">Student <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-6 py-4 font-medium text-text-muted">Form</th>
              <th className="px-6 py-4 font-medium text-text-muted cursor-pointer hover:text-text transition-colors" onClick={() => handleSort('balance')}>
                <div className="flex items-center gap-2">Balance <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-6 py-4 font-medium text-text-muted cursor-pointer hover:text-text transition-colors" onClick={() => handleSort('total_paid')}>
                <div className="flex items-center gap-2">Paid <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-6 py-4 font-medium text-text-muted cursor-pointer hover:text-text transition-colors" onClick={() => handleSort('total_billed')}>
                <div className="flex items-center gap-2">Billed <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-6 py-4 font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBalances.map((balance) => (
              <tr key={balance.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-text">{balance.student.full_name}</div>
                  <div className="text-[11px] text-text-muted font-mono">{balance.student.admission_number}</div>
                </td>
                <td className="px-6 py-4 text-text-muted">
                  {balance.student.form.replace('_', ' ')} {balance.student.stream}
                </td>
                <td className="px-6 py-4 font-mono font-medium">
                  <span className={cn(
                    balance.balance === 0 ? "text-success" : 
                    balance.balance >= 5000 ? "text-danger" : "text-amber"
                  )}>
                    {balance.balance === 0 ? "Cleared" : `KES ${balance.balance.toLocaleString('en-KE')}`}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted font-mono">
                  KES {balance.total_paid.toLocaleString('en-KE')}
                </td>
                <td className="px-6 py-4 text-text-muted font-mono">
                  KES {balance.total_billed.toLocaleString('en-KE')}
                </td>
                <td className="px-6 py-4">
                  {isAccountant && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-accent hover:bg-accent/10"
                        onClick={() => onPay?.(balance.student.id, balance.fee_structure.id)}
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                        Pay
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-success hover:bg-success/10"
                        onClick={() => onStkPush?.(balance.student.id)}
                      >
                        <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                        STK
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface/50 border-t-2 border-border font-bold">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-text">Total School Summary</td>
              <td className="px-6 py-4 font-mono text-danger">KES {totals.balance.toLocaleString('en-KE')}</td>
              <td className="px-6 py-4 font-mono text-success">KES {totals.paid.toLocaleString('en-KE')}</td>
              <td className="px-6 py-4 font-mono text-text">KES {totals.billed.toLocaleString('en-KE')}</td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
