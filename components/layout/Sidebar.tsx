'use client'

import { UserRole } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import SidebarItem from './SidebarItem'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useInbox } from '@/hooks/useComms'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  label: string
  href: string
  icon: string
}

const NAV_CONFIG: Record<string, NavItem[]> = {
  [UserRole.PRINCIPAL]: [
    { label: 'Dashboard', href: '/principal', icon: 'LayoutDashboard' },
    { label: 'Students', href: '/students', icon: 'Users' },
    { label: 'Discipline', href: '/discipline', icon: 'AlertTriangle' },
    { label: 'Finance', href: '/accountant', icon: 'CreditCard' },
    { label: 'Messages', href: '/comms', icon: 'MessageSquare' },
    { label: 'Staff', href: '/staff', icon: 'UserCheck' },
  ],
  [UserRole.DEPUTY_PRINCIPAL]: [
    { label: 'Dashboard', href: '/deputy', icon: 'LayoutDashboard' },
    { label: 'Students', href: '/students', icon: 'Users' },
    { label: 'Discipline', href: '/discipline', icon: 'AlertTriangle' },
    { label: 'Attendance', href: '/teacher/attendance', icon: 'CheckSquare' },
  ],
  [UserRole.HOD]: [
    { label: 'Dashboard', href: '/hod', icon: 'LayoutDashboard' },
    { label: 'Students', href: '/students', icon: 'Users' },
    { label: 'Attendance', href: '/teacher/attendance', icon: 'CheckSquare' },
  ],
  [UserRole.CLASS_TEACHER]: [
    { label: 'My Class', href: '/teacher', icon: 'LayoutDashboard' },
    { label: 'Attendance', href: '/teacher/attendance', icon: 'CheckSquare' },
    { label: 'Discipline', href: '/discipline', icon: 'AlertTriangle' },
  ],
  [UserRole.ACCOUNTANT]: [
    { label: 'Dashboard', href: '/accountant', icon: 'LayoutDashboard' },
    { label: 'Payments', href: '/accountant/payments', icon: 'CreditCard' },
    { label: 'Reports', href: '/accountant/reports', icon: 'BarChart2' },
  ],
  [UserRole.PARENT]: [
    { label: 'Messages', href: '/comms', icon: 'MessageSquare' },
    { label: 'My Child', href: '/students', icon: 'User' },
  ],
  [UserRole.NURSE]: [
    { label: 'Students', href: '/students', icon: 'Users' },
    { label: 'Medical', href: '/medical', icon: 'Heart' },
  ],
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { unreadCount } = useInbox()
  
  if (!user) return null

  const navItems = NAV_CONFIG[user.role] || []

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[240px] bg-[#151820] border-r border-[#1E2330] flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:inset-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Top Section */}
      <div className="p-6 flex flex-col gap-2">
        <h1 className="font-display text-[22px] text-[#2DD4BF] leading-none">
          Sychar
        </h1>
        <div className="font-body font-medium text-[11px] text-[#64748B] tracking-[0.15em] uppercase">
          CoPilot
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 pt-8 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            label={item.label} 
            href={item.href} 
            icon={item.icon as any} 
            badge={item.label === 'Messages' ? unreadCount : undefined}
          />
        ))}
      </nav>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-[#1E2330] flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[#1E2330] flex items-center justify-center text-[#2DD4BF] text-sm font-medium shrink-0">
          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#F1F5F9] text-sm font-medium truncate">
            {user.full_name}
          </p>
          <div className="inline-flex px-1.5 py-0.5 rounded-full bg-[#2DD4BF14] text-[#2DD4BF] text-[10px] font-bold uppercase tracking-wider">
            {user.role.replace('_', ' ')}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="text-[#64748B] hover:text-[#EF4444] shrink-0"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  )
}
