'use client'

import { AuthUser, UserRole } from '@/types'
import { cn } from '@/lib/utils'
import RoleBadge from '@/components/shared/RoleBadge'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Users } from 'lucide-react'

interface StaffTableProps {
  staff: AuthUser[]
  isLoading: boolean
}

export default function StaffTable({ staff, isLoading }: StaffTableProps) {
  if (isLoading) return <LoadingSkeleton rows={8} cols={5} />
  if (staff.length === 0) return <EmptyState message="No staff members found" icon={Users} />

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-6 py-4 font-medium text-text-muted">Name</th>
              <th className="px-6 py-4 font-medium text-text-muted">Email</th>
              <th className="px-6 py-4 font-medium text-text-muted">Role</th>
              <th className="px-6 py-4 font-medium text-text-muted">Assignment</th>
              <th className="px-6 py-4 font-medium text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-surface-hover transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-dim flex items-center justify-center text-accent font-bold text-xs uppercase">
                      {member.full_name[0]}
                    </div>
                    <span className="font-medium text-text group-hover:text-accent transition-colors">
                      {member.full_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted font-mono text-xs">
                  {member.email}
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-6 py-4 text-text-muted">
                  {member.role === UserRole.CLASS_TEACHER && member.assigned_form ? (
                    <span className="bg-surface border border-border px-2 py-1 rounded text-[10px] font-bold uppercase">
                      {member.assigned_form.replace('_', ' ')} {member.assigned_stream}
                    </span>
                  ) : member.role === UserRole.HOD && member.department ? (
                    <span className="text-[11px] uppercase tracking-wider">{member.department} Dept</span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider border border-success/20">
                    <div className="w-1 h-1 rounded-full bg-success" />
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
