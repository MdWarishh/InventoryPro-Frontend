'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useSSE } from '@/hooks/useSSE'

// ─── DashboardShell ───────────────────────────────────────────────────────────
// Wraps all dashboard pages. Handles:
// - Sidebar collapse state (persisted)
// - Mobile menu open/close
// - SSE connection (via hook)

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  // Start collapsed on mobile, expanded on desktop
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Start SSE connection
  useSSE()

  // Persist sidebar collapse preference
  useEffect(() => {
    const saved = localStorage.getItem('inv-sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem('inv-sidebar-collapsed', String(!v))
      return !v
    })
  }

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0a0a0f]">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}