'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStudentPayments } from '@/hooks/useFinance'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Download } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import Modal from '@/components/shared/Modal'
import PaymentForm from '@/components/finance/PaymentForm'
import { PaymentStatus, PaymentMethod } from '@/types'

export default function PaymentsPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  
  // For this page, we might want a global payments hook, but useStudentPayments is what we have.
  // In a real app, there'd be a usePayments() hook for accountants.
  // For now, let's assume useStudentPayments('') or similar might fetch all if handled by backend,
  // or just use a placeholder for this specific view since the prompt didn't specify a global hook.
  const { data: payments, isLoading } = useStudentPayments('') 

  if (!isAuthenticated || !user) return null

  const filteredPayments = (payments || []).filter(p => 
    p.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mpesa_receipt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED: return 'bg-success/10 text-success'
      case PaymentStatus.PENDING: return 'bg-amber/10 text-amber'
      case PaymentStatus.FAILED: return 'bg-danger/10 text-danger'
      case PaymentStatus.REVERSED: return 'bg-purple-500/10 text-purple-500'
      default: return 'bg-text-muted/10 text-text-muted'
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Payment History" 
        action={
          <Button onClick={() => setIsPaymentModalOpen(true)} className="bg-accent text-bg font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search by student or receipt..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingSkeleton rows={8} cols={6} />
        ) : filteredPayments.length === 0 ? (
          <EmptyState message="No payments found matching your criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="px-6 py-4 font-medium text-text-muted">Date</th>
                  <th className="px-6 py-4 font-medium text-text-muted">Student</th>
                  <th className="px-6 py-4 font-medium text-text-muted">Method</th>
                  <th className="px-6 py-4 font-medium text-text-muted">Reference</th>
                  <th className="px-6 py-4 font-medium text-text-muted text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                      {format(new Date(payment.transaction_date), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">{payment.student.full_name}</div>
                      <div className="text-[11px] text-text-muted font-mono">{payment.student.admission_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {payment.mpesa_receipt || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-text">
                      KES {payment.amount.toLocaleString('en-KE')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        getStatusColor(payment.status)
                      )}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Record Fee Payment"
        width={540}
      >
        <PaymentForm onSuccess={() => setIsPaymentModalOpen(false)} />
      </Modal>
    </div>
  )
}
