'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useSSE } from '@/hooks/useSSE'
import { navItems } from '@/config/nav.config'

function getPageTitle(pathname: string): string {
  const item = navItems.find((n) => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)))
  return item?.label || 'Dashboard'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useSSE()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(v => !v)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 md:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}