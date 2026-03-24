import { AttendanceSummary } from '@/types'

interface AttendanceSummaryCardProps {
  summary: AttendanceSummary
}

export default function AttendanceSummaryCard({ summary }: AttendanceSummaryCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-sm text-text">{summary.student.full_name}</p>
      <p className="text-xs font-mono text-text-muted">{summary.student.admission_number}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <p>Present: {summary.present}</p>
        <p>Absent: {summary.absent}</p>
        <p>Late: {summary.late}</p>
        <p>Excused: {summary.excused}</p>
      </div>
      <div className="mt-4">
        <p className="text-xs text-text-muted">Attendance Rate</p>
        <p className="font-display text-2xl text-accent">{summary.attendance_rate.toFixed(1)}%</p>
      </div>
    </div>
  )
}
