'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import { useStudentBalance, useStudentPayments } from '@/hooks/useFinance'
import { useStudentIncidents, useDisciplineScore } from '@/hooks/useDiscipline'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import DisciplineScoreBar from '@/components/discipline/DisciplineScoreBar'
import CollectionProgressBar from '@/components/finance/CollectionProgressBar'
import SeverityBadge from '@/components/discipline/SeverityBadge'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { UserRole } from '@/types'
import { format } from 'date-fns'
import { Users, AlertTriangle, CheckCircle2, MessageSquare, CreditCard, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ParentDashboard() {
  const { user, isAuthenticated } = useAuth()
  
  // Fetch linked students for this parent
  const { data: students, isLoading: studentsLoading } = useStudents()
  
  // For now, we'll take the first linked student. In a real app with multiple children, 
  // we'd have a switcher.
  const activeStudent = students?.[0]
  
  const { data: balance, isLoading: balanceLoading } = useStudentBalance(activeStudent?.id || '')
  const { data: score, isLoading: scoreLoading } = useDisciplineScore(activeStudent?.id || '')
  const { data: incidents, isLoading: incidentsLoading } = useStudentIncidents(activeStudent?.id || '')
  const { data: payments, isLoading: paymentsLoading } = useStudentPayments(activeStudent?.id || '')

  if (!isAuthenticated || !user) return null

  if (studentsLoading) return <LoadingSkeleton rows={10} cols={4} />

  if (!activeStudent) {
    return (
      <div className="space-y-8 page-container">
        <PageHeader title="Welcome to Sychar CoPilot" subtitle="Manage your child's school records" />
        <div className="py-20">
          <EmptyState 
            message="No child linked to your account yet." 
            subMessage="Please click 'Link Child' in the sidebar or students page to get started."
            icon={Users} 
          />
          <div className="mt-8 flex justify-center">
            <Link 
              href="/students" 
              className="bg-accent text-bg font-bold px-6 py-3 rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2"
            >
              Go to Link Child
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isLoading = balanceLoading || scoreLoading || incidentsLoading || paymentsLoading

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title={`Hello, ${user.full_name.split(' ')[0]}`}
        subtitle={`Parent dashboard for ${activeStudent.full_name} (${activeStudent.admission_number})`}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Attendance Rate" 
          value="94%" 
          color="success" 
          sub="Present for 42 / 45 days"
        />
        <StatCard 
          label="Fee Balance" 
          value={`KES ${Number(balance?.balance || 0).toLocaleString('en-KE')}`} 
          color={Number(balance?.balance || 0) > 0 ? "amber" : "success"}
          sub={Number(balance?.balance || 0) > 0 ? "Outstanding" : "Cleared"}
        />
        <StatCard 
          label="Discipline Score" 
          value={score?.score || 100} 
          color={(score?.score || 100) >= 80 ? "success" : (score?.score || 100) >= 50 ? "amber" : "danger"} 
          sub={`${score?.total_incidents || 0} incidents recorded`}
        />
        <StatCard 
          label="Next Event" 
          value="Parent-Teacher Meeting" 
          color="accent" 
          sub="Friday, 28 March"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Academic & Finance */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-text">Fee Status</h2>
              <Link href="/accountant" className="text-xs text-accent hover:underline font-bold uppercase tracking-wider">
                View History
              </Link>
            </div>
            
            <CollectionProgressBar 
              collected={Number(balance?.total_paid || 0)} 
              total={Number(balance?.total_billed || 0)} 
              label="Term 1 2026 Fees"
            />

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="bg-bg border border-border p-4 rounded-lg">
                <p className="text-[10px] text-text-faint uppercase font-bold tracking-widest mb-1">Last Payment</p>
                <p className="text-sm font-mono font-bold text-success">
                  {payments?.[0] ? `KES ${Number(payments[0].amount).toLocaleString()}` : 'No payments yet'}
                </p>
                <p className="text-[10px] text-text-faint mt-1">
                  {payments?.[0] ? format(new Date(payments[0].transaction_date), 'dd MMM yyyy') : '-'}
                </p>
              </div>
              <div className="bg-bg border border-border p-4 rounded-lg">
                <p className="text-[10px] text-text-faint uppercase font-bold tracking-widest mb-1">Term Balance</p>
                <p className="text-sm font-mono font-bold text-danger">
                  KES {Number(balance?.balance || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-text-faint mt-1">Due by end of term</p>
              </div>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-text">Recent Discipline</h2>
              <Link href="/discipline" className="text-xs text-accent hover:underline font-bold uppercase tracking-wider">
                All Incidents
              </Link>
            </div>

            <div className="space-y-4">
              <DisciplineScoreBar score={score?.score || 100} size="md" />
              
              <div className="divide-y divide-border">
                {incidents?.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-faint">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{inc.incident_type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-text-faint font-mono uppercase">
                          {format(new Date(inc.incident_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <SeverityBadge severity={inc.severity} />
                  </div>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <div className="py-8 text-center text-text-faint italic text-sm">
                    No incidents recorded. Keeping up the good work!
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Communication & Alerts */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-display text-xl text-text">Quick Communications</h2>
            <div className="space-y-3">
              <Link 
                href="/comms" 
                className="w-full bg-accent text-bg font-bold h-12 flex items-center justify-center gap-2 rounded-lg hover:bg-accent/90 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                Message Principal
              </Link>
              <button 
                disabled
                className="w-full border border-border text-text-muted cursor-not-allowed font-bold h-12 flex items-center justify-center gap-2 rounded-lg"
              >
                <Users className="h-5 w-5" />
                Request Meeting
              </button>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-display text-xl text-text">Notifications</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber/10 border border-amber/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">Fee Balance Reminder</p>
                  <p className="text-xs text-text-muted mt-1">A balance of KES {Number(balance?.balance || 0).toLocaleString()} is remaining for Term 1.</p>
                </div>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">Academic Update</p>
                  <p className="text-xs text-text-muted mt-1">Progress reports for Mid-Term 1 are now available for download.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
