'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDeficitTrajectory, useFeeStructures, useTermAccounts } from '@/hooks/useFinance'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, Term, StudentFeeAccount } from '@/types'
import StatCard from '@/components/shared/StatCard'
import CollectionProgressBar from '@/components/finance/CollectionProgressBar'
import FeeAccountTable from '@/components/finance/FeeAccountTable'
import DeficitChart from '@/components/finance/DeficitChart'
import Modal from '@/components/shared/Modal'
import PaymentForm from '@/components/finance/PaymentForm'
import MpesaSTKModal from '@/components/finance/MpesaSTKModal'
import BulkAssignModal from '@/components/finance/BulkAssignModal'
import ExemptionModal from '@/components/finance/ExemptionModal'
import { CreditCard, Smartphone, Download, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountantDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [selectedTerm, setSelectedTerm] = useState<Term>(Term.TERM_1)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedForm, setSelectedForm] = useState<Form | ''>('')
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<string>('')
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isStkModalOpen, setIsStkModalOpen] = useState(false)
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false)
  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false)
  const [activeStudentId, setActiveStudentId] = useState<string | undefined>()
  const [activeFeeAccountId, setActiveFeeAccountId] = useState<string | undefined>()
  const [selectedAccount, setSelectedAccount] = useState<StudentFeeAccount | null>(null)

  const { feeStructures } = useFeeStructures({ term: selectedTerm, year: selectedYear })
  const { accounts, isLoading: accountsLoading } = useTermAccounts({
    feeStructureId: selectedFeeStructureId || undefined,
    form: selectedForm || undefined,
  })
  const { trajectory } = useDeficitTrajectory(selectedFeeStructureId)

  if (!isAuthenticated || !user) return null

  const openPayModal = (account?: StudentFeeAccount) => {
    setActiveStudentId(account?.student.id)
    setActiveFeeAccountId(account?.id)
    setIsPayModalOpen(true)
  }

  const openStkModal = (account?: StudentFeeAccount) => {
    setActiveStudentId(account?.student.id)
    setActiveFeeAccountId(account?.id)
    setIsStkModalOpen(true)
  }

  const totalBilled = accounts.reduce((acc, curr) => acc + Number(curr.billed_amount), 0)
  const totalPaid = accounts.reduce((acc, curr) => acc + Number(curr.total_paid), 0)
  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0
  const counts = {
    pending: accounts.filter((a) => a.status === 'PENDING').length,
    partial: accounts.filter((a) => a.status === 'PARTIAL').length,
    cleared: accounts.filter((a) => a.status === 'CLEARED').length,
    overpaid: accounts.filter((a) => a.status === 'OVERPAID').length,
  }

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title="Finance Overview" 
        subtitle={new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        action={
          <div className="flex items-center gap-3">
            <div className="flex bg-surface border border-border p-1 rounded-lg">
              {[Term.TERM_1, Term.TERM_2, Term.TERM_3].map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    selectedTerm === term ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                  )}
                >
                  {term.replace('_', ' ')}
                </button>
              ))}
            </div>
            <Input 
              type="number" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-24 h-10 font-mono text-center"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Billed" 
          value={`KES ${totalBilled.toLocaleString('en-KE')}`} 
          color="accent" 
        />
        <StatCard 
          label="Total Collected" 
          value={`KES ${totalPaid.toLocaleString('en-KE')}`} 
          color="success" 
        />
        <StatCard 
          label="Collection Rate" 
          value={`${Math.round(collectionRate)}%`} 
          color={collectionRate >= 80 ? "success" : collectionRate >= 50 ? "amber" : "danger"} 
        />
        <StatCard 
          label="Pending / Partial" 
          value={`${counts.pending} / ${counts.partial}`}
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending" value={counts.pending} color="muted" />
        <StatCard label="Partial" value={counts.partial} color="amber" />
        <StatCard label="Cleared" value={counts.cleared} color="success" />
        <StatCard label="Overpaid" value={counts.overpaid} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl">Collection Trajectory</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Report
                </Button>
              </div>
            </div>
            {selectedFeeStructureId && trajectory ? (
              <DeficitChart trajectory={trajectory} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted italic">
                Select a fee structure to view trajectory
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Fee Accounts</h2>
              <div className="flex items-center gap-4">
                <select
                  value={selectedFeeStructureId}
                  onChange={(e) => {
                    setSelectedFeeStructureId(e.target.value)
                    const fs = feeStructures.find((item) => item.id === e.target.value)
                    setSelectedForm(fs?.form || '')
                  }}
                  className="bg-surface border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select fee structure...</option>
                  {feeStructures.map((fs) => (
                    <option key={fs.id} value={fs.id}>
                      {fs.form.replace('form_', 'Form ')} · {fs.term.replace('_', ' ')} · {fs.academic_year}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                  onClick={() => setIsBulkAssignModalOpen(true)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <Plus className="h-4 w-4 mr-1" />
                  Assign Term Fees
                </Button>
              </div>
            </div>
            <FeeAccountTable
              accounts={accounts}
              isLoading={accountsLoading}
              onPay={openPayModal}
              onSTK={openStkModal}
              onExemption={(account) => {
                setSelectedAccount(account)
                setIsExemptionModalOpen(true)
              }}
            />
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-display text-xl">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => openPayModal()} 
                className="w-full bg-accent text-bg font-bold h-12 flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Record Manual Payment
              </Button>
              <Button 
                onClick={() => openStkModal()}
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent/10 font-bold h-12 flex items-center justify-center gap-2"
              >
                <Smartphone className="h-5 w-5" />
                Initiate M-Pesa STK
              </Button>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-display text-xl">Term Collection</h2>
            <CollectionProgressBar 
              collected={trajectory?.total_collected || totalPaid}
              total={trajectory?.effective_billed || totalBilled}
              label={`${selectedTerm.replace('_', ' ')} ${selectedYear}`}
            />
            {trajectory && trajectory.total_exemptions > 0 && (
              <p className="text-xs text-text-muted">KES {Math.round(trajectory.total_exemptions).toLocaleString('en-KE')} in exemptions</p>
            )}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Target (Total Billed)</span>
                <span className="font-mono font-bold text-text">KES {(trajectory?.effective_billed || totalBilled).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Currently Paid</span>
                <span className="font-mono font-bold text-success">KES {(trajectory?.total_collected || totalPaid).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-dashed border-border">
                <span className="text-text">Gap to Target</span>
                <span className="font-mono text-danger">KES {((trajectory?.effective_billed || totalBilled) - (trajectory?.total_collected || totalPaid)).toLocaleString('en-KE')}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)} 
        title="Record Fee Payment"
        width={540}
      >
        <PaymentForm 
          onSuccess={() => setIsPayModalOpen(false)} 
          defaultStudentId={activeStudentId}
          defaultFeeAccountId={activeFeeAccountId}
        />
      </Modal>

      <Modal 
        isOpen={isStkModalOpen} 
        onClose={() => setIsStkModalOpen(false)} 
        title="M-Pesa STK Push"
        width={420}
      >
        <MpesaSTKModal 
          isOpen={isStkModalOpen}
          onClose={() => setIsStkModalOpen(false)} 
          defaultStudentId={activeStudentId}
        />
      </Modal>

      <Modal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        title="Assign Term Fees"
        width={560}
      >
        <BulkAssignModal
          isOpen={isBulkAssignModalOpen}
          onClose={() => setIsBulkAssignModalOpen(false)}
          onSuccess={(newFeeStructureId) => setSelectedFeeStructureId(newFeeStructureId)}
        />
      </Modal>

      <Modal
        isOpen={isExemptionModalOpen}
        onClose={() => setIsExemptionModalOpen(false)}
        title="Apply Exemption"
        width={520}
      >
        <ExemptionModal
          isOpen={isExemptionModalOpen}
          onClose={() => setIsExemptionModalOpen(false)}
          account={selectedAccount}
        />
      </Modal>
    </div>
  )
}
