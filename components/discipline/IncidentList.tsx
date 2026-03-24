'use client'

import { useState } from 'react'
import { DisciplineIncident, IncidentStatus, Severity, UserRole } from '@/types'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, ShieldCheck, MoreVertical } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'
import Modal from '@/components/shared/Modal'
import { useUpdateIncident } from '@/hooks/useDiscipline'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface IncidentListProps {
  incidents: DisciplineIncident[]
  isLoading: boolean
  showFilters?: boolean
}

export default function IncidentList({ incidents, isLoading, showFilters = false }: IncidentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewIncident, setReviewIncident] = useState<DisciplineIncident | null>(null)
  const { user } = useAuth()
  const updateMutation = useUpdateIncident()

  const [localFilters, setLocalFilters] = useState({
    status: '',
    severity: '',
    search: '',
  })

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = !localFilters.status || incident.status === localFilters.status
    const matchesSeverity = !localFilters.severity || incident.severity === localFilters.severity
    const matchesSearch = !localFilters.search || 
      incident.student.full_name.toLowerCase().includes(localFilters.search.toLowerCase()) ||
      incident.student.admission_number.toLowerCase().includes(localFilters.search.toLowerCase())
    return matchesStatus && matchesSeverity && matchesSearch
  })

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!reviewIncident) return

    const formData = new FormData(e.currentTarget)
    const status = formData.get('status') as IncidentStatus
    const action_taken = formData.get('action_taken') as string

    try {
      await updateMutation.mutateAsync({
        id: reviewIncident.id,
        data: { status, action_taken }
      })
      toast.success('Incident updated')
      setReviewIncident(null)
    } catch (err) {
      toast.error('Failed to update incident')
    }
  }

  if (isLoading) return <LoadingSkeleton rows={6} cols={6} />
  if (incidents.length === 0) return <EmptyState message="No incidents found" icon={ShieldCheck} />

  const canReview = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.DEPUTY_PRINCIPAL

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search student..."
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
          />
          <select 
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            value={localFilters.severity}
            onChange={(e) => setLocalFilters({ ...localFilters, severity: e.target.value })}
          >
            <option value="">All Severities</option>
            {Object.values(Severity).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-6 py-4 font-medium text-text-muted">Student</th>
              <th className="px-6 py-4 font-medium text-text-muted">Type</th>
              <th className="px-6 py-4 font-medium text-text-muted">Severity</th>
              <th className="px-6 py-4 font-medium text-text-muted">Date</th>
              <th className="px-6 py-4 font-medium text-text-muted">Status</th>
              <th className="px-6 py-4 font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => (
              <>
                <tr 
                  key={incident.id} 
                  className={cn(
                    "hover:bg-surface-hover cursor-pointer transition-colors border-b border-border last:border-0",
                    expandedId === incident.id && "bg-surface-hover"
                  )}
                  onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">{incident.student.full_name}</div>
                    <div className="text-[11px] text-text-muted font-mono">{incident.student.admission_number}</div>
                  </td>
                  <td className="px-6 py-4 text-text-muted capitalize">
                    {incident.incident_type.toLowerCase().replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {format(new Date(incident.incident_date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      incident.status === IncidentStatus.OPEN && "bg-danger/10 text-danger",
                      incident.status === IncidentStatus.UNDER_REVIEW && "bg-amber/10 text-amber",
                      incident.status === IncidentStatus.RESOLVED && "bg-success/10 text-success",
                      incident.status === IncidentStatus.ESCALATED && "bg-purple-500/10 text-purple-500",
                    )}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {canReview && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-accent hover:bg-accent/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setReviewIncident(incident)
                          }}
                        >
                          Review
                        </Button>
                      )}
                      {expandedId === incident.id ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                    </div>
                  </td>
                </tr>
                {expandedId === incident.id && (
                  <tr className="bg-bg/50">
                    <td colSpan={6} className="px-10 py-6 border-b border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block">Incident Description</Label>
                          <p className="text-sm text-text leading-relaxed bg-surface p-4 rounded-lg border border-border">
                            {incident.description}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block">Action Taken</Label>
                            <p className="text-sm text-text italic">
                              {incident.action_taken || 'No action recorded yet.'}
                            </p>
                          </div>
                          <div className="flex gap-8 text-[11px] text-text-muted border-t border-border pt-4">
                            <div>
                              <span className="block font-medium uppercase text-[9px] mb-1">Reported By</span>
                              {incident.reported_by.full_name}
                            </div>
                            {incident.reviewed_by && (
                              <div>
                                <span className="block font-medium uppercase text-[9px] mb-1">Reviewed By</span>
                                {incident.reviewed_by.full_name}
                              </div>
                            )}
                            {incident.resolved_at && (
                              <div>
                                <span className="block font-medium uppercase text-[9px] mb-1">Resolved At</span>
                                {format(new Date(incident.resolved_at), 'dd MMM yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={!!reviewIncident} 
        onClose={() => setReviewIncident(null)} 
        title="Review Incident"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Update Status</Label>
            <select 
              name="status"
              defaultValue={reviewIncident?.status}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-accent outline-none"
            >
              {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Action Taken</Label>
            <Textarea 
              name="action_taken"
              defaultValue={reviewIncident?.action_taken || ''}
              placeholder="Detail the disciplinary actions taken..."
              rows={4}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-bg font-bold h-11"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
