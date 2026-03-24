import { UserRole } from '@/types'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: UserRole
}

const roleColors: Record<UserRole, string> = {
  [UserRole.PRINCIPAL]: 'bg-accent/10 text-accent',
  [UserRole.DEPUTY_PRINCIPAL]: 'bg-amber/10 text-amber',
  [UserRole.HOD]: 'bg-purple-500/10 text-purple-500',
  [UserRole.CLASS_TEACHER]: 'bg-blue-500/10 text-blue-500',
  [UserRole.ACCOUNTANT]: 'bg-success/10 text-success',
  [UserRole.PARENT]: 'bg-gray-500/10 text-gray-500',
  [UserRole.NURSE]: 'bg-pink-500/10 text-pink-500',
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={cn(
      'inline-block px-2 py-1 text-xs font-medium uppercase rounded-full',
      roleColors[role]
    )}>
      {role.replace('_', ' ')}
    </span>
  )
}
