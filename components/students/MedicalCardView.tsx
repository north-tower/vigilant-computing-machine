import { MedicalCard } from '@/types'
import { useMedicalCard } from '@/hooks/useStudents'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { Heart } from 'lucide-react'

interface MedicalCardViewProps {
  studentId: string
}

export default function MedicalCardView({ studentId }: MedicalCardViewProps) {
  const { data: card, isLoading, error } = useMedicalCard(studentId)

  if (isLoading) return <LoadingSkeleton rows={6} cols={1} />
  if (error || !card) return <EmptyState message="No medical card on file. Contact the school nurse." />

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg text-text">Medical Card</h2>
        <Heart className="h-6 w-6 text-danger" />
      </div>

      <div className="space-y-4">
        <div className="border border-danger rounded-lg p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-danger">Blood Type</p>
          <p className="font-display text-4xl text-danger mt-1">{card.blood_type || 'N/A'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {card.allergies.filter(a => a.trim() !== '').length > 0 ? (
              card.allergies.filter(a => a.trim() !== '').map(allergy => <span key={allergy} className="px-2 py-1 text-xs font-medium bg-danger/20 text-danger rounded-full">{allergy}</span>)
            ) : <p className="text-xs text-text-muted">None reported</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Chronic Conditions</h3>
          <div className="flex flex-wrap gap-2">
            {card.chronic_conditions.filter(c => c.trim() !== '').length > 0 ? (
              card.chronic_conditions.filter(c => c.trim() !== '').map(condition => <span key={condition} className="px-2 py-1 text-xs font-medium bg-amber/20 text-amber rounded-full">{condition}</span>)
            ) : <p className="text-xs text-text-muted">None reported</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Current Medications</h3>
          <div className="flex flex-wrap gap-2">
            {card.current_medications.filter(m => m.trim() !== '').length > 0 ? (
              card.current_medications.filter(m => m.trim() !== '').map(med => <span key={med} className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">{med}</span>)
            ) : <p className="text-xs text-text-muted">None</p>}
          </div>
        </div>

        <div className="bg-danger/10 border border-danger rounded-lg p-4">
          <h3 className="text-sm font-semibold text-danger mb-2">Emergency Contact</h3>
          <p className="text-text">{card.emergency_contact_name} ({card.emergency_contact_relation})</p>
          <p className="text-text font-mono text-lg">{card.emergency_contact_phone}</p>
        </div>

        {card.medical_notes && (
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-2">Medical Notes</h3>
            <p className="text-sm text-text-muted whitespace-pre-wrap">{card.medical_notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
