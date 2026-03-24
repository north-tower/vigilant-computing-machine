'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useIncidents, useClassScoreboard, useOpenIncidents } from '@/hooks/useDiscipline'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import Modal from '@/components/shared/Modal'
import IncidentForm from '@/components/discipline/IncidentForm'
import IncidentList from '@/components/discipline/IncidentList'
import DisciplineScoreBar from '@/components/discipline/DisciplineScoreBar'
import StatCard from '@/components/shared/StatCard'
import { UserRole, IncidentStatus } from '@/types'
import { ShieldAlert, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DisciplinePage() {
  const { user, isAuthenticated } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const teacherFilters = user?.role === UserRole.CLASS_TEACHER ? { 
    form: user.assigned_form!, 
    stream: user.assigned_stream! 
  } : undefined

  const { data: incidents, isLoading } = useIncidents(teacherFilters)
  const { data: scoreboard } = useClassScoreboard(
    user?.assigned_form || ('' as any), 
    user?.assigned_stream || ('' as any)
  )
  const { data: openIncidents } = useOpenIncidents()

  if (!isAuthenticated || !user) return null

  const isAdmin = user.role === UserRole.PRINCIPAL || user.role === UserRole.DEPUTY_PRINCIPAL

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title={isAdmin ? "Discipline Management" : "Discipline"} 
        action={
          <Button onClick={() => setIsFormOpen(true)} className="bg-accent text-bg font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        }
      />

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Open Incidents" value={openIncidents?.length || 0} color="danger" />
          <StatCard label="Escalated" value={incidents?.filter(i => i.status === IncidentStatus.ESCALATED).length || 0} color="amber" />
          <StatCard label="Resolved This Term" value={incidents?.filter(i => i.status === IncidentStatus.RESOLVED).length || 0} color="success" />
          <StatCard label="Avg School Score" value="84" color="accent" />
        </div>
      )}

      {isAdmin ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-bg">All Incidents</TabsTrigger>
            <TabsTrigger value="open" className="data-[state=active]:bg-danger data-[state=active]:text-white">Open</TabsTrigger>
            <TabsTrigger value="escalated" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Escalated</TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-success data-[state=active]:text-white">Resolved</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <IncidentList incidents={incidents || []} isLoading={isLoading} showFilters />
          </TabsContent>
          <TabsContent value="open" className="mt-6">
            <IncidentList incidents={(incidents || []).filter(i => i.status === IncidentStatus.OPEN)} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="escalated" className="mt-6">
            <IncidentList incidents={(incidents || []).filter(i => i.status === IncidentStatus.ESCALATED)} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="resolved" className="mt-6">
            <IncidentList incidents={(incidents || []).filter(i => i.status === IncidentStatus.RESOLVED)} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber" />
              Recent Class Incidents
            </h2>
            <IncidentList incidents={incidents || []} isLoading={isLoading} />
          </section>

          {user.role === UserRole.CLASS_TEACHER && scoreboard && (
            <section>
              <h2 className="font-display text-xl mb-4">Class Scoreboard</h2>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      <th className="px-6 py-4 font-medium text-text-muted w-16">Rank</th>
                      <th className="px-6 py-4 font-medium text-text-muted">Student</th>
                      <th className="px-6 py-4 font-medium text-text-muted">Standing</th>
                      <th className="px-6 py-4 font-medium text-text-muted text-center">Incidents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboard.sort((a, b) => a.score - b.score).map((entry, idx) => (
                      <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 font-mono text-text-muted">#{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text">{entry.student.full_name}</div>
                          <div className="text-[11px] text-text-muted font-mono">{entry.student.admission_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <DisciplineScoreBar score={entry.score} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-center font-mono">{entry.total_incidents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Report Discipline Incident"
        width={540}
      >
        <IncidentForm onSuccess={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  )
}
