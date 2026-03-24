'use client'

import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  ResponsiveContainer 
} from 'recharts'
import { DeficitTrajectory } from '@/types'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from 'lucide-react'

interface DeficitChartProps {
  trajectory: DeficitTrajectory
}

export default function DeficitChart({ trajectory }: DeficitChartProps) {
  // Generate daily data for the chart (assuming a 90-day term)
  const chartData = Array.from({ length: 90 }, (_, i) => {
    const day = i + 1
    const totalBilled = trajectory.total_billed
    const projectedFinal = trajectory.projected_collection
    
    // Actual: up to days_elapsed
    const actual = day <= trajectory.days_elapsed 
      ? (trajectory.total_collected / trajectory.days_elapsed) * day 
      : null

    // Projected: straight line from 0 to projected_collection over 90 days
    const projected = (projectedFinal / 90) * day

    return {
      day,
      actual,
      projected,
      target: totalBilled
    }
  })

  const riskConfig = {
    low: { label: 'Low Risk', color: 'bg-success/10 text-success border-success', icon: ShieldCheck },
    medium: { label: 'Medium Risk', color: 'bg-amber/10 text-amber border-amber', icon: AlertTriangle },
    high: { label: 'High Risk — Intervention Needed', color: 'bg-danger/10 text-danger border-danger font-bold', icon: AlertTriangle },
  }

  const risk = riskConfig[trajectory.risk_level]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const actualData = payload.find((p: any) => p.dataKey === 'actual')
      const projectedData = payload.find((p: any) => p.dataKey === 'projected')

      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-xl text-xs space-y-2">
          <p className="font-bold text-text">Day {payload[0].payload.day}</p>
          <div className="space-y-1">
            {actualData && actualData.value !== null && (
              <p className="flex justify-between gap-4">
                <span className="text-text-muted">Actual:</span>
                <span className="text-accent font-mono">KES {Math.round(actualData.value).toLocaleString()}</span>
              </p>
            )}
            {projectedData && (
              <p className="flex justify-between gap-4">
                <span className="text-text-muted">Projected:</span>
                <span className="text-amber font-mono">KES {Math.round(projectedData.value).toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider border",
          risk.color
        )}>
          <risk.icon className="h-3.5 w-3.5" />
          {risk.label}
        </div>
        <div className="text-xs text-text-muted flex items-center gap-2">
          {trajectory.daily_velocity > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-danger" />}
          KES {Math.round(trajectory.daily_velocity).toLocaleString()}/day velocity
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="day" 
              fontSize={10} 
              tick={{ fill: 'var(--text-muted)' }} 
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              label={{ value: 'Days into Term', position: 'bottom', offset: 0, fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <YAxis 
              fontSize={10} 
              tick={{ fill: 'var(--text-muted)' }} 
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={trajectory.total_billed} 
              stroke="var(--danger)" 
              strokeDasharray="3 3" 
              label={{ value: 'Target', fill: 'var(--text-muted)', fontSize: 10, position: 'right' }} 
            />
            <Bar dataKey="actual" fill="var(--accent)" radius={[2, 2, 0, 0]} opacity={0.8} />
            <Line dataKey="projected" stroke="var(--amber)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Collection Rate', value: `${Math.round(trajectory.collection_rate)}%` },
          { label: 'Days Remaining', value: trajectory.days_remaining },
          { label: 'Projected Deficit', value: `KES ${Math.round(trajectory.projected_deficit).toLocaleString()}`, color: 'text-danger' },
          { label: 'Daily Velocity', value: `KES ${Math.round(trajectory.daily_velocity).toLocaleString()}` },
        ].map((metric) => (
          <div key={metric.label} className="bg-surface border border-border rounded-lg p-3 text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{metric.label}</p>
            <p className={cn("text-xs font-mono font-bold", metric.color || "text-text")}>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
