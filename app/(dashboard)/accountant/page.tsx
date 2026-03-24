'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClassBalances, useDeficitTrajectory, useFeeStructures } from '@/hooks/useFinance'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, Term, UserRole } from '@/types'
import StatCard from '@/components/shared/StatCard'
import CollectionProgressBar from '@/components/finance/CollectionProgressBar'
import FeeBalanceTable from '@/components/finance/FeeBalanceTable'
import DeficitChart from '@/components/finance/DeficitChart'
import Modal from '@/components/shared/Modal'
import PaymentForm from '@/components/finance/PaymentForm'
import MpesaSTKModal from '@/components/finance/MpesaSTKModal'
import { CreditCard, Smartphone, Filter, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountantDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [selectedTerm, setSelectedTerm] = useState<Term>(Term.TERM_1)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedForm, setSelectedForm] = useState<Form>(Form.FORM_1)
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isStkModalOpen, setIsStkModalOpen] = useState(false)
  const [activeStudentId, setActiveStudentId] = useState<string | undefined>()
  const [activeFeeId, setActiveFeeId] = useState<string | undefined>()

  const { data: balances, isLoading: balancesLoading } = useClassBalances(selectedForm, 'A' as any)
  const { data: trajectory } = useDeficitTrajectory(selectedForm, selectedTerm, selectedYear)
  const { data: feeStructures } = useFeeStructures({ term: selectedTerm, year: selectedYear })

  if (!isAuthenticated || !user) return null

  const openPayModal = (studentId?: string, feeId?: string) => {
    setActiveStudentId(studentId)
    setActiveFeeId(feeId)
    setIsPayModalOpen(true)
  }

  const openStkModal = (studentId?: string) => {
    setActiveStudentId(studentId)
    setIsStkModalOpen(true)
  }

  const activeFee = feeStructures?.find(f => f.form === selectedForm)
  const totalBilled = balances?.reduce((acc, curr) => acc + Number(curr.total_billed), 0) || 0
  const totalPaid = balances?.reduce((acc, curr) => acc + Number(curr.total_paid), 0) || 0
  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0

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
          label="Outstanding" 
          value={`KES ${(totalBilled - totalPaid).toLocaleString('en-KE')}`} 
          color="danger" 
        />
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
            {trajectory ? (
              <DeficitChart trajectory={trajectory} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted italic">
                No trajectory data for selected filters.
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Fee Balances</h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-surface border border-border p-1 rounded-lg">
                  {Object.values(Form).map((form) => (
                    <button
                      key={form}
                      onClick={() => setSelectedForm(form)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                        selectedForm === form ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                      )}
                    >
                      {form.replace('form_', 'F')}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <FeeBalanceTable 
              balances={balances || []} 
              isLoading={balancesLoading} 
              onPay={openPayModal}
              onStkPush={openStkModal}
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
              collected={totalPaid} 
              total={totalBilled} 
              label={`${selectedTerm.replace('_', ' ')} ${selectedYear}`}
            />
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Target (Total Billed)</span>
                <span className="font-mono font-bold text-text">KES {totalBilled.toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Currently Paid</span>
                <span className="font-mono font-bold text-success">KES {totalPaid.toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-dashed border-border">
                <span className="text-text">Gap to Target</span>
                <span className="font-mono text-danger">KES {(totalBilled - totalPaid).toLocaleString('en-KE')}</span>
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
          defaultFeeStructureId={activeFeeId}
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
    </div>
  )
}
