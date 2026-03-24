'use client'

import { useAuth } from '@/hooks/useAuth'
import { useInbox } from '@/hooks/useComms'
import { useIncidents, useOpenIncidents } from '@/hooks/useDiscipline'
import { useDeficitTrajectory } from '@/hooks/useFinance'
import { useStudents } from '@/hooks/useStudents'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import DeficitChart from '@/components/finance/DeficitChart'
import TriageSummaryCard from '@/components/principal/TriageSummaryCard'
import AlertFeed from '@/components/principal/AlertFeed'
import SeverityBadge from '@/components/discipline/SeverityBadge'
import PriorityBadge from '@/components/comms/PriorityBadge'
import { Form, Term, IncidentStatus } from '@/types'
import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PrincipalDashboard() {
  const { user } = useAuth()
  const [selectedForm, setSelectedForm] = useState<Form | 'ALL'>('ALL')
  
  const { data: students } = useStudents()
  const { data: inbox, unreadCount } = useInbox()
  const { data: openIncidents } = useOpenIncidents()
  const { data: trajectory } = useDeficitTrajectory(
    selectedForm === 'ALL' ? Form.FORM_1 : selectedForm, 
    Term.TERM_1, 
    '2026'
  )

  const firstName = user?.full_name.split(' ')[0]
  const today = format(new Date(), 'EEEE, dd MMMM yyyy')

  const collectionRate = trajectory?.collection_rate || 0

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title={`Good morning, ${firstName}`}
        subtitle={today}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={students?.length || 0} 
          color="accent" 
        />
        <StatCard 
          label="Fee Collection Rate" 
          value={`${Math.round(collectionRate)}%`} 
          color={collectionRate >= 80 ? "success" : collectionRate >= 50 ? "amber" : "danger"} 
        />
        <StatCard 
          label="Open Incidents" 
          value={openIncidents?.length || 0} 
          color={!openIncidents?.length ? "success" : openIncidents.length < 5 ? "amber" : "danger"} 
        />
        <StatCard 
          label="Unread Messages" 
          value={unreadCount} 
          color={unreadCount > 0 ? "danger" : "muted"} 
        />
      </div>

      {/* Row 2: Finance & Comms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text">Fee Collection Trajectory</h2>
            <div className="flex bg-surface border border-border p-1 rounded-lg">
              {['ALL', Form.FORM_1, Form.FORM_2, Form.FORM_3, Form.FORM_4].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedForm(f as any)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    selectedForm === f ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                  )}
                >
                  {f === 'ALL' ? 'All' : f.replace('form_', 'F')}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            {trajectory && <DeficitChart trajectory={trajectory} />}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text">Communications</h2>
            <Link href="/comms" className="text-xs text-accent hover:underline flex items-center gap-1 font-bold uppercase tracking-wider">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <TriageSummaryCard messages={inbox || []} />
            
            <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
              {inbox?.slice(0, 5).map((msg) => (
                <Link 
                  key={msg.id} 
                  href={`/comms?id=${msg.id}`}
                  className="p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors group"
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    msg.priority === 'URGENT' ? "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-text-faint"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate group-hover:text-accent transition-colors">
                      {msg.sender.full_name}
                    </p>
                    <p className="text-xs text-text-muted truncate">{msg.subject}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-text-faint font-mono uppercase">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </Link>
              ))}
              {(!inbox || inbox.length === 0) && (
                <div className="p-8 text-center text-text-faint italic text-sm">
                  No recent messages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Discipline & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text">Discipline Overview</h2>
            <Link href="/discipline" className="text-xs text-accent hover:underline flex items-center gap-1 font-bold uppercase tracking-wider">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <div key={s} className="bg-surface border border-border rounded-lg p-3 text-center">
                  <p className="text-[9px] text-text-faint uppercase font-bold tracking-widest mb-1">{s}</p>
                  <p className="text-lg font-display text-text">
                    {openIncidents?.filter(i => i.severity === s).length || 0}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
              {openIncidents?.slice(0, 5).map((inc) => (
                <div key={inc.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-faint">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{inc.student.full_name}</p>
                      <p className="text-[10px] text-text-faint font-mono uppercase">
                        {format(new Date(inc.incident_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <SeverityBadge severity={inc.severity} />
                </div>
              ))}
              {(!openIncidents || openIncidents.length === 0) && (
                <div className="p-8 text-center text-text-faint italic text-sm">
                  No open incidents recorded
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-xl text-text">Active Alerts</h2>
          <AlertFeed />
        </div>
      </div>
    </div>
  )
}
