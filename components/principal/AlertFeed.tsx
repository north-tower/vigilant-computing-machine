'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { AttendanceSummary, DisciplineIncident, DeficitTrajectory, Message, IncidentStatus, FeeStructure } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Alert {
  id: string
  type: 'attendance' | 'discipline' | 'finance' | 'message'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export default function AlertFeed() {
  // Parallel queries for summary data
  const { data: attendance } = useQuery<AttendanceSummary[]>({ 
    queryKey: ['attendance', 'summary'], 
    queryFn: async () => (await api.get('/attendance/summary')).data 
  })
  const { data: incidents } = useQuery<DisciplineIncident[]>({ 
    queryKey: ['incidents', 'open'], 
    queryFn: async () => (await api.get('/discipline/open')).data 
  })
  const { data: trajectory } = useQuery<DeficitTrajectory>({ 
    queryKey: ['finance', 'trajectory', 'latest'],
    queryFn: async () => {
      const structures = (await api.get('/finance/fee-structures')).data as FeeStructure[]
      const active = structures.find((s) => s.is_active)
      if (!active) return null as any
      return (await api.get('/finance/fee-accounts/trajectory', { params: { feeStructureId: active.id } })).data
    }, 
  })
  const { data: messages } = useQuery<Message[]>({ 
    queryKey: ['inbox', { is_read: false }], 
    queryFn: async () => (await api.get('/comms/inbox', { params: { is_read: false } })).data 
  })

  // Compute alerts
  const alerts: Alert[] = []

  // 1. Attendance alerts
  attendance?.filter(a => a.attendance_rate < 75).forEach(a => {
    alerts.push({
      id: `att-${a.student.id}`,
      type: 'attendance',
      message: `${a.student.full_name} is below 75% attendance`,
      severity: 'medium',
      timestamp: new Date(),
    })
  })

  // 2. Discipline alerts
  incidents?.forEach(i => {
    if (i.status === IncidentStatus.ESCALATED) {
      alerts.push({
        id: `disc-${i.id}`,
        type: 'discipline',
        message: `Escalated discipline incident: ${i.student.full_name}`,
        severity: 'high',
        timestamp: new Date(i.created_at),
      })
    }
  })

  // 3. Finance alerts
  if (trajectory && trajectory.total_students > 0 && trajectory.accounts_pending / trajectory.total_students > 0.1) {
    alerts.push({
      id: 'fin-deficit',
      type: 'finance',
      message: `KES ${Math.round(trajectory.projected_deficit).toLocaleString('en-KE')} projected term deficit — ${trajectory.risk_level} risk`,
      severity: trajectory.risk_level === 'high' ? 'high' : 'medium',
      timestamp: new Date(),
    })
  }

  // 4. Message alerts
  const urgentMessages = messages?.filter(m => m.priority === 'URGENT')
  if (urgentMessages && urgentMessages.length > 0) {
    alerts.push({
      id: 'msg-urgent',
      type: 'message',
      message: `${urgentMessages.length} urgent messages require attention`,
      severity: 'critical',
      timestamp: new Date(),
    })
  }

  // Sort and limit
  const sortedAlerts = alerts
    .sort((a, b) => {
      const severityMap = { critical: 4, high: 3, medium: 2, low: 1 }
      if (severityMap[a.severity] !== severityMap[b.severity]) {
        return severityMap[b.severity] - severityMap[a.severity]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
    .slice(0, 8)

  if (sortedAlerts.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <p className="text-sm text-text-muted">No active alerts. All school systems within normal parameters.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
      {sortedAlerts.map((alert) => (
        <Link href={alert.type === 'finance' ? '/accountant' : '#'} key={alert.id} className="p-4 flex items-start gap-4 hover:bg-surface-hover transition-colors group">
          <div className={cn(
            "mt-1 w-3 h-3 rounded-full shrink-0",
            alert.severity === 'critical' || alert.severity === 'high' ? "bg-danger" : 
            alert.severity === 'medium' ? "bg-amber" : "bg-success"
          )} />
          
          <div className="flex-1 space-y-1">
            <p className="text-sm text-text font-medium leading-none group-hover:text-accent transition-colors">
              {alert.message}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-text-faint font-mono uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
