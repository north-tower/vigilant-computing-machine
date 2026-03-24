'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStaff } from '@/hooks/useStaff'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/types'
import StaffTable from '@/components/staff/StaffTable'
import Modal from '@/components/shared/Modal'
import CreateStaffModal from '@/components/staff/CreateStaffModal'
import { Plus, Search, Filter, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function StaffPage() {
  const { user, isAuthenticated } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')

  const { data: staff, isLoading } = useStaff(roleFilter === 'ALL' ? undefined : roleFilter)

  if (!isAuthenticated || !user) return null
  if (user.role !== UserRole.PRINCIPAL) {
    redirect('/principal')
  }

  const filteredStaff = (staff || []).filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 page-container">
      <PageHeader 
        title="Staff Management" 
        subtitle="Manage administrative and teaching staff accounts"
        action={
          <Button onClick={() => setIsModalOpen(true)} className="bg-accent text-bg font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Search staff by name or email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-bg border border-border p-1 rounded-lg">
            {['ALL', UserRole.CLASS_TEACHER, UserRole.HOD, UserRole.ACCOUNTANT].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role as any)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  roleFilter === role ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                )}
              >
                {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium uppercase tracking-widest px-1">
          <Users className="w-3 h-3" />
          Showing {filteredStaff.length} staff members
        </div>
        <StaffTable staff={filteredStaff} isLoading={isLoading} />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Staff Account"
        width={600}
      >
        <CreateStaffModal onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
