'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  label: string
  href: string
  icon: keyof typeof LucideIcons
  badge?: number
}

export default function SidebarItem({ label, href, icon, badge }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const Icon = LucideIcons[icon] as any

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative group",
        isActive 
          ? "bg-[#2DD4BF14] text-[#2DD4BF] border-l-2 border-[#2DD4BF]" 
          : "text-[#F1F5F9] hover:bg-[#1A1F2E] border-l-2 border-transparent"
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </Link>
  )
}
